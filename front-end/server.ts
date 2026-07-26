import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import * as serverDb from './serverDb';
import { UserRole } from './src/types/pos';

// Allow calling localhost C# backend using self-signed HTTPS certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'https://localhost:62491';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mock server APIs for offline capability toggle (VITE_USE_SERVICES="true")
  app.get('/api/products', (req, res) => {
    res.json(serverDb.products);
  });
  app.put('/api/products/:id', (req, res) => {
    const idx = serverDb.products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      serverDb.products[idx] = { ...serverDb.products[idx], ...req.body };
      res.json({ success: true, product: serverDb.products[idx] });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  app.get('/api/coupons', (req, res) => {
    res.json(serverDb.coupons);
  });
  app.put('/api/coupons/:id', (req, res) => {
    const idx = serverDb.coupons.findIndex(c => c.id === req.params.id);
    if (idx !== -1) {
      serverDb.coupons[idx] = { ...serverDb.coupons[idx], ...req.body };
      res.json({ success: true, coupon: serverDb.coupons[idx] });
    } else {
      res.status(404).json({ error: 'Coupon not found' });
    }
  });
  app.get('/api/coupons/code/:code', (req, res) => {
    const coupon = serverDb.coupons.find(c => c.code.toLowerCase() === req.params.code.toLowerCase());
    res.json(coupon || null);
  });
  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal, cartProductIds } = req.body;
    const coupon = serverDb.coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (!coupon) {
      return res.json({ isValid: false, calculatedDiscount: 0, message: 'Invalid coupon code.' });
    }
    if (!coupon.isActive) {
      return res.json({ isValid: false, coupon, calculatedDiscount: 0, message: 'Coupon is inactive.' });
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (todayStr < coupon.startDate || todayStr > coupon.endDate) {
      return res.json({
        isValid: false,
        coupon,
        calculatedDiscount: 0,
        message: `Coupon is valid only from ${coupon.startDate} to ${coupon.endDate}.`,
      });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.json({ isValid: false, coupon, calculatedDiscount: 0, message: 'Coupon usage limit has been reached.' });
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.json({
        isValid: false,
        coupon,
        calculatedDiscount: 0,
        message: `Minimum order amount of $${coupon.minOrderAmount.toFixed(2)} required.`,
      });
    }
    if (coupon.applicableProductIds && coupon.applicableProductIds.length > 0) {
      const hasApplicableProduct = cartProductIds.some((id: string) => coupon.applicableProductIds.includes(id));
      if (!hasApplicableProduct) {
        return res.json({
          isValid: false,
          coupon,
          calculatedDiscount: 0,
          message: 'Coupon is not applicable to any items in the cart.',
        });
      }
    }
    let discount = coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
    if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
    res.json({
      isValid: true,
      coupon,
      calculatedDiscount: Math.min(discount, subtotal),
      message: `Coupon ${coupon.code} applied successfully!`,
    });
  });

  app.get('/api/members', (req, res) => {
    res.json(serverDb.members);
  });
  app.get('/api/members/search', (req, res) => {
    const q = (req.query.q as string || '').toLowerCase();
    const found = serverDb.members.find(m => m.phone.toLowerCase() === q || m.memberNo.toLowerCase() === q);
    res.json(found || null);
  });
  app.put('/api/members/:id', (req, res) => {
    const idx = serverDb.members.findIndex(m => m.id === req.params.id);
    if (idx !== -1) {
      serverDb.members[idx] = { ...serverDb.members[idx], ...req.body };
      res.json({ success: true, member: serverDb.members[idx] });
    } else {
      res.status(404).json({ error: 'Member not found' });
    }
  });

  app.get('/api/orders', (req, res) => {
    res.json(serverDb.orders);
  });
  app.post('/api/orders', (req, res) => {
    serverDb.orders.push(req.body);
    res.json({ success: true });
  });

  app.get('/api/shifts/active', (req, res) => {
    const cashierId = req.query.cashierId as string;
    const active = serverDb.shifts.find(s => s.cashierId === cashierId && s.status === 'OPEN');
    res.json(active || null);
  });
  app.post('/api/shifts', (req, res) => {
    serverDb.shifts.push(req.body);
    res.json({ success: true });
  });
  app.put('/api/shifts/:id', (req, res) => {
    const idx = serverDb.shifts.findIndex(s => s.id === req.params.id);
    if (idx !== -1) {
      serverDb.shifts[idx] = { ...serverDb.shifts[idx], ...req.body };
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Shift not found' });
    }
  });

  app.get('/api/drawer-logs', (req, res) => {
    res.json(serverDb.drawerOpenLogs);
  });
  app.post('/api/drawer-logs', (req, res) => {
    serverDb.drawerOpenLogs.push(req.body);
    res.json({ success: true });
  });

  app.get('/api/schedules', (req, res) => {
    res.json(serverDb.shiftSchedules);
  });
  app.post('/api/schedules', (req, res) => {
    serverDb.shiftSchedules.push(req.body);
    res.json({ success: true });
  });
  app.put('/api/schedules/:id', (req, res) => {
    const idx = serverDb.shiftSchedules.findIndex(s => s.id === req.params.id);
    if (idx !== -1) {
      serverDb.shiftSchedules[idx] = { ...serverDb.shiftSchedules[idx], ...req.body };
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Schedule not found' });
    }
  });

  app.get('/api/swaps', (req, res) => {
    res.json(serverDb.shiftSwaps);
  });
  app.post('/api/swaps', (req, res) => {
    serverDb.shiftSwaps.push(req.body);
    res.json({ success: true });
  });
  app.put('/api/swaps/:id', (req, res) => {
    const idx = serverDb.shiftSwaps.findIndex(s => s.id === req.params.id);
    if (idx !== -1) {
      serverDb.shiftSwaps[idx] = { ...serverDb.shiftSwaps[idx], ...req.body };
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Swap not found' });
    }
  });

  app.get('/api/proposed-pos', (req, res) => {
    res.json(serverDb.proposedPOs);
  });
  app.post('/api/proposed-pos', (req, res) => {
    serverDb.proposedPOs.push(req.body);
    res.json({ success: true });
  });
  app.put('/api/proposed-pos/:id', (req, res) => {
    const idx = serverDb.proposedPOs.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      serverDb.proposedPOs[idx] = { ...serverDb.proposedPOs[idx], ...req.body };
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Proposed PO not found' });
    }
  });

  app.get('/api/stock-batches', (req, res) => {
    res.json(serverDb.stockBatches);
  });
  app.post('/api/stock-batches', (req, res) => {
    serverDb.stockBatches.push(req.body);
    res.json({ success: true });
  });

  app.get('/api/role-routes', (req, res) => {
    res.json(serverDb.roleRoutes);
  });
  app.put('/api/role-routes/:role', (req, res) => {
    const idx = serverDb.roleRoutes.findIndex(r => r.role === req.params.role);
    if (idx !== -1) {
      serverDb.roleRoutes[idx].routes = req.body.routes;
      res.json({ success: true });
    } else {
      serverDb.roleRoutes.push({ role: req.params.role as UserRole, routes: req.body.routes });
      res.json({ success: true });
    }
  });

  app.get('/api/attendance', (req, res) => {
    res.json(serverDb.attendance);
  });
  app.get('/api/leaves', (req, res) => {
    res.json(serverDb.leaves);
  });

  // Swagger schema proxy call
  app.get('/api/external-swagger', async (_req, res) => {
    try {
      const headers: Record<string, string> = {};
      const functionsKey = process.env.X_FUNCTIONS_KEY || process.env.X_FUNCTION_KEY;
      if (functionsKey) {
        headers['x-functions-key'] = functionsKey;
      }
      const response = await fetch(`${BACKEND_URL}/swagger/v1/swagger.json`, { headers });
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('Swagger fetch error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Proxy to .NET backend API
  app.all('/api/external/*', async (req, res) => {
    const targetPath = req.params[0];
    const queryString = new URLSearchParams(req.query as any).toString();
    const url = `${BACKEND_URL}/api/${targetPath}${queryString ? '?' + queryString : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const functionsKey = process.env.X_FUNCTIONS_KEY || process.env.X_FUNCTION_KEY || req.headers['x-functions-key'];
    if (functionsKey) {
      headers['x-functions-key'] = functionsKey as string;
    }

    const options: RequestInit = {
      method: req.method,
      headers
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }

    try {
      const response = await fetch(url, options);
      if (response.status === 204) {
        return res.status(204).end();
      }
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text };
      }
      res.status(response.status).json(data);
    } catch (err: any) {
      console.error(`Proxy error for ${url}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Gemini AI Smart Upsell Endpoint
  app.post('/api/gemini/upsell', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { memberName, memberPoints, cartItems, availableProducts } = req.body;

      if (!cartItems || !Array.isArray(cartItems)) {
        return res.status(400).json({ error: 'cartItems must be an array' });
      }

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        // Fallback intelligent response if API key is not yet configured in local environment
        const suggested = (availableProducts || []).find(
          (p: any) => !cartItems.some((ci: any) => ci.id === p.id)
        ) || {
          id: 'p6',
          name: 'Truffle Fries',
          price: 8.50,
          category: 'Appetizers'
        };

        return res.json({
          script: `Since ${memberName || 'our valued member'} enjoys our signature items, recommend adding ${suggested.name} to earn double loyalty points today!`,
          recommendedProduct: suggested,
          reason: 'Frequently paired item with high member satisfaction.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are an AI Smart Upsell Assistant for an enterprise POS system.
Member Name: ${memberName || 'Valued Member'}
Member Loyalty Points: ${memberPoints || 0}
Current Cart Items: ${JSON.stringify(cartItems)}
Available Store Catalog Products: ${JSON.stringify(availableProducts || [])}

Goal: Recommend 1 product from the Available Store Catalog Products that is NOT already in the cart, and create a 1-sentence cashier script that is natural, concise, and persuasive. Include an incentive like bonus points or discount pairing.

Respond in JSON with this schema:
{
  "script": "1 sentence script for cashier to say out loud",
  "recommendedProductId": "ID of recommended product",
  "reason": "Brief reason for cashier"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              script: { type: Type.STRING },
              recommendedProductId: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ['script', 'recommendedProductId', 'reason'],
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      const recommendedProduct = (availableProducts || []).find(
        (p: any) => p.id === parsed.recommendedProductId
      ) || (availableProducts && availableProducts[0]) || {
        id: 'p6',
        name: 'Truffle Fries',
        price: 8.50,
      };

      res.json({
        script: parsed.script,
        recommendedProduct,
        reason: parsed.reason,
      });
    } catch (err: any) {
      console.error('Gemini API Upsell Error:', err);
      // Return graceful fallback so the POS terminal never breaks
      res.json({
        script: 'Would you like to add our popular Truffle Fries for 10% extra bonus member points today?',
        recommendedProduct: {
          id: 'p6',
          name: 'Truffle Fries',
          price: 8.50,
          category: 'Appetizers'
        },
        reason: 'Popular high-margin side item.'
      });
    }
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
