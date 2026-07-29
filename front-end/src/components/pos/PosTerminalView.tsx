import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Scan,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Tag,
  User,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Receipt,
  Printer,
  ShieldCheck,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Product, CartItem, Member, Coupon, Order } from '../../types/pos';
import { GeminiAiSmartUpsell } from './GeminiAiSmartUpsell';
import { SplitPaymentModal } from './SplitPaymentModal';
import { db } from '@/src/db/dexieDb';
import { computeHmacSignature } from '../../utils/crypto';

interface PosTerminalViewProps {
  cashierId: string;
  cashierName: string;
  terminalId: string;
  currentUser?: any;
  onRequireManagerPin: (
    title: string,
    desc: string,
    reason: 'VOID_ORDER' | 'REFUND' | 'NO_SALE' | 'PRICE_OVERRIDE',
    onSuccess: () => void
  ) => void;
}

export const PosTerminalView: React.FC<PosTerminalViewProps> = ({
  cashierId,
  cashierName,
  terminalId,
  currentUser,
  onRequireManagerPin,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isVatInclusive, setIsVatInclusive] = useState<boolean>(true);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');

  // Member search
  const [memberSearch, setMemberSearch] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberMessage, setMemberMessage] = useState<string>('');

  // Modals
  const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [currentOrderNo, setCurrentOrderNo] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const list = await apiService.getProducts();
    setProducts(list);
  };

  const categories = ['All Items', 'Beverages', 'Appetizers', 'Main Course', 'Desserts'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All Items' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product, modifiers: string[] = []) => {
    if (product.stock <= 0) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          JSON.stringify(item.selectedModifiers) === JSON.stringify(modifiers)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            selectedModifiers: modifiers,
            itemDiscount: 0,
          },
        ];
      }
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    onRequireManagerPin(
      'Void Current Order',
      'Requires manager approval to clear non-empty cart session.',
      'VOID_ORDER',
      () => {
        setCart([]);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponSuccess('');
        setCouponError('');
      }
    );
  };

  // Calculations
  const rawSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity - item.itemDiscount,
    0
  );

  // VAT 7%
  const vatRate = 0.07;
  let vatAmount = 0;
  let subtotal = rawSubtotal;

  if (isVatInclusive) {
    // Inclusive: Tax is inside subtotal
    vatAmount = subtotal - subtotal / (1 + vatRate);
    subtotal = subtotal - vatAmount;
  } else {
    // Exclusive: Tax added on top
    vatAmount = subtotal * vatRate;
  }

  const grandTotal = Math.max(
    0,
    isVatInclusive
      ? (subtotal + vatAmount) - couponDiscount
      : subtotal + vatAmount - couponDiscount
  );

  // Offline Coupon Validation against Dexie / API
  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setCouponSuccess('');

    const cartProductIds = cart.map((c) => c.product.id);
    const result = await apiService.validateCoupon(couponCode, subtotal, cartProductIds);

    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setCouponDiscount(result.calculatedDiscount);
      setCouponSuccess(result.message);
    } else {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponError(result.message);
    }
  };

  // Member Search
  const handleSearchMember = async () => {
    if (!memberSearch.trim()) return;
    setMemberMessage('');

    const found = await apiService.findMemberByPhoneOrNo(memberSearch);

    if (found) {
      setSelectedMember(found);
      setMemberMessage(`Member ${found.name} attached!`);
    } else {
      setSelectedMember(null);
      setMemberMessage('Member not found. Try phone "0812345678" or "M-1001".');
    }
  };

  const handleOpenPayment = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const branchCode = currentUser?.selectedBranchCode || '35';
    const termCode = currentUser?.selectedTerminalId || 'N02';
    const prefix = `S${todayStart.getFullYear().toString().slice(-2)}${String(todayStart.getMonth() + 1).padStart(2, '0')}${String(todayStart.getDate()).padStart(2, '0')}${branchCode}${termCode}-`;

    const todayCount = await db.orders
      .where('createdAt')
      .aboveOrEqual(todayStart.toISOString())
      .filter(o => o.orderNo.startsWith(prefix))
      .count();

    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const sequence = String(todayCount + 1).padStart(6, '0');
    const orderNo = `${prefix}${sequence}`;

    setCurrentOrderNo(orderNo);
    setIsSplitPaymentOpen(true);
  };

  const handleQuickCashCheckout = async () => {
    if (cart.length === 0) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const branchCode = currentUser?.selectedBranchCode || '35';
    const termCode = currentUser?.selectedTerminalId || 'N02';
    const prefix = `S${todayStart.getFullYear().toString().slice(-2)}${String(todayStart.getMonth() + 1).padStart(2, '0')}${String(todayStart.getDate()).padStart(2, '0')}${branchCode}${termCode}-`;

    const todayCount = await db.orders
      .where('createdAt')
      .aboveOrEqual(todayStart.toISOString())
      .filter(o => o.orderNo.startsWith(prefix))
      .count();

    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const sequence = String(todayCount + 1).padStart(6, '0');
    const orderNo = `${prefix}${sequence}`;

    const orderId = `ord-${Date.now()}`;
    const createdAt = now.toISOString();

    // Calculate HMAC Signature
    const hmacSig = await computeHmacSignature(orderId, orderNo, grandTotal, createdAt);

    const payments = [
      {
        id: `pay-${Date.now()}-cash`,
        method: 'Cash',
        amount: grandTotal,
        timestamp: createdAt,
      },
    ];

    await handleCompleteOrder(payments, hmacSig, orderId, orderNo, createdAt);
  };

  const handleCompleteOrder = async (
    payments: any[],
    hmacSignature: string,
    customOrderId?: string,
    customOrderNo?: string,
    customCreatedAt?: string
  ) => {
    const finalOrderId = customOrderId || `ord-${Date.now()}`;
    const finalOrderNo = customOrderNo || currentOrderNo;
    const finalCreatedAt = customCreatedAt || new Date().toISOString();

    const mappedItems = cart.map(item => {
      const itemRawSubtotal = item.product.price * item.quantity - item.itemDiscount;
      let itemVat = 0;
      let itemSubtotalBeforeVat = itemRawSubtotal;

      if (isVatInclusive) {
        itemVat = itemRawSubtotal - itemRawSubtotal / (1 + vatRate);
        itemSubtotalBeforeVat = itemRawSubtotal - itemVat;
      } else {
        itemVat = itemRawSubtotal * vatRate;
        itemSubtotalBeforeVat = itemRawSubtotal;
      }

      return {
        ...item,
        subtotal: Number(itemSubtotalBeforeVat.toFixed(2)),
        vatAmount: Number(itemVat.toFixed(2))
      };
    });

    const newOrder: Order = {
      id: finalOrderId,
      orderNo: finalOrderNo,
      items: mappedItems,
      subtotal,
      vatRate,
      vatAmount,
      isVatInclusive,
      couponCode: appliedCoupon?.code,
      discountAmount: couponDiscount,
      grandTotal,
      payments,
      status: 'COMPLETED',
      createdAt: finalCreatedAt,
      hmacSignature,
      cashierId,
      cashierName,
      memberId: selectedMember?.id,
      memberName: selectedMember?.name,
      branchId: currentUser?.selectedBranchId,
      posTerminalId: currentUser?.selectedTerminalDbId,
    };

    // Save to Dexie IndexedDB / Server
    await apiService.addOrder(newOrder);

    // Update product stock counts
    for (const item of cart) {
      await apiService.updateProduct(item.product.id, {
        stock: Math.max(0, item.product.stock - item.quantity),
      });
    }

    // Increment coupon usedCount if coupon was applied
    if (appliedCoupon) {
      await apiService.updateCoupon(appliedCoupon.id, {
        usedCount: appliedCoupon.usedCount + 1,
      });
    }

    // Award member points if member attached (e.g. 1 point per $1)
    if (selectedMember) {
      const earnedPoints = Math.floor(grandTotal);
      await apiService.updateMember(selectedMember.id, {
        points: selectedMember.points + earnedPoints,
      });
    }

    await loadProducts();
    setLastCompletedOrder(newOrder);
    setIsSplitPaymentOpen(false);

    // Reset Cart
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponSuccess('');
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Left Pane: Product Grid & Search */}
      <section className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-900/60">
        {/* Search & Barcode Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-800 dark:text-slate-100 shadow-2xs font-medium text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                // Simulate barcode scan of random product
                const rand = products[Math.floor(Math.random() * products.length)];
                if (rand) addToCart(rand);
              }}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:text-orange-600 transition-all shadow-2xs"
            >
              <Scan className="w-4 h-4 text-orange-600" /> Scan Barcode
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const inCart = cart.find((c) => c.product.id === product.id);
            const isLowStock = product.stock <= product.minStockThreshold;

            return (
              <div
                key={product.id}
                onClick={() => product.stock > 0 && addToCart(product)}
                className={`bg-white dark:bg-slate-800 rounded-2xl border p-2.5 flex flex-col group cursor-pointer transition-all duration-300 relative overflow-hidden ${inCart
                    ? 'border-2 border-orange-600 shadow-md ring-2 ring-orange-600/20'
                    : 'border-slate-200 dark:border-slate-700/80 hover:shadow-lg hover:border-orange-500'
                  } ${product.stock <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {inCart && (
                  <div className="absolute top-2 right-2 z-10 bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                    {inCart.quantity} IN CART
                  </div>
                )}

                {isLowStock && product.stock > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    LOW STOCK ({product.stock})
                  </div>
                )}

                <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-700 relative">
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center text-white font-bold text-xs">
                      OUT OF STOCK
                    </div>
                  )}
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-300">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="px-1 flex flex-col flex-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mb-1">
                    {product.name}
                  </span>
                  <div className="flex justify-between items-end mt-auto">
                    <span className="text-orange-600 font-extrabold text-base">
                      {product.price.toFixed(2)} บาท
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Pane: Cart & Checkout Summary */}
      <section className="w-full md:w-[420px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shadow-2xl z-20">
        {/* Order Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-30">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active POS Session</div>
            <div className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <span>Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            </div>
          </div>

          <button
            onClick={handleClearCart}
            disabled={cart.length === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 disabled:opacity-30 transition-colors"
            title="Void Order / Clear Cart"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt List & Member Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Member Loyalty Section */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-orange-600" /> Member Loyalty Lookup
              </label>
              {selectedMember && (
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-[10px] text-rose-500 font-bold hover:underline"
                >
                  Detach
                </button>
              )}
            </div>

            {!selectedMember ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Phone or Member ID (e.g. 0812345678)"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none"
                />
                <button
                  onClick={handleSearchMember}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Find
                </button>
              </div>
            ) : null}

            {memberMessage && !selectedMember && (
              <p className="text-[11px] font-medium text-amber-600">{memberMessage}</p>
            )}

            {/* AI Smart Upsell Component when member attached */}
            {selectedMember && (
              <GeminiAiSmartUpsell
                member={selectedMember}
                cartItems={cart}
                availableProducts={products}
                onAddProductToCart={(p) => addToCart(p)}
              />
            )}
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
              <p className="font-semibold text-sm">Your cart is currently empty.</p>
              <p className="text-xs">Click products on the left or scan barcode to add.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="flex gap-3 p-2.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl shadow-2xs"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">
                        {item.product.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {item.product.name}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                        {(item.product.price * item.quantity).toFixed(2)} บาท
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(idx, -1)}
                          className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold text-xs px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, 1)}
                          className="w-6 h-6 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        @ {item.product.price.toFixed(2)} บาท ea
                      </span>
                    </div>

                    {/* Quick Modifiers */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {['Extra Cheese', 'No Pickles'].map((mod) => {
                        const isSelected = item.selectedModifiers.includes(mod);
                        return (
                          <button
                            key={mod}
                            onClick={() => {
                              const updated = [...cart];
                              if (isSelected) {
                                updated[idx].selectedModifiers = updated[idx].selectedModifiers.filter((m) => m !== mod);
                              } else {
                                updated[idx].selectedModifiers.push(mod);
                              }
                              setCart(updated);
                            }}
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full transition-colors ${isSelected
                                ? 'bg-orange-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                          >
                            {mod}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Offline Coupon Section */}
          <form onSubmit={handleApplyCoupon} className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" /> Offline Coupon Promo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try 'WELCOME10' or 'FLASH5'"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-orange-500 outline-none uppercase"
              />
              <button
                type="submit"
                disabled={!couponCode.trim() || cart.length === 0}
                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs disabled:opacity-40"
              >
                Apply
              </button>
            </div>

            {couponSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-2 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{couponSuccess}</span>
              </div>
            )}

            {couponError && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-2 rounded-xl text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{couponError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer Summary & Checkout Button */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* VAT Inclusive/Exclusive Toggle */}
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>VAT Calculation (7%)</span>
            <button
              onClick={() => setIsVatInclusive(!isVatInclusive)}
              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 rounded-lg font-bold text-[10px] text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
            >
              {isVatInclusive ? 'VAT Inclusive (Included)' : 'VAT Exclusive (+7%)'}
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">{subtotal.toFixed(2)} บาท</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>VAT 7% ({isVatInclusive ? 'incl.' : 'add.'})</span>
              <span className="font-mono font-semibold">{vatAmount.toFixed(2)} บาท</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span className="font-mono">-{couponDiscount.toFixed(2)} บาท</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">Grand Total</span>
              <span className="font-['Manrope'] font-extrabold text-3xl text-orange-600">
                {grandTotal.toFixed(2)} บาท
              </span>
            </div>
          </div>

          {/* Proceed to Split Payment Checkout Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleQuickCashCheckout}
              disabled={cart.length === 0}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
            >
              <Banknote className="w-5 h-5" />
              <span>PAY CASH (FULL)</span>
            </button>
            <button
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className="flex-1 border-2 border-slate-300 dark:border-slate-700 hover:border-slate-400 disabled:opacity-40 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <CreditCard className="w-5 h-5" />
              <span>SPLIT PAYMENT</span>
            </button>
          </div>
        </div>
      </section>

      {/* Split Payment Modal */}
      <SplitPaymentModal
        isOpen={isSplitPaymentOpen}
        grandTotal={grandTotal}
        orderNo={currentOrderNo}
        onCancel={() => setIsSplitPaymentOpen(false)}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* Completed Order Receipt Modal */}
      {lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-['Manrope'] font-bold text-xl text-slate-900 dark:text-slate-100">
                Transaction Completed!
              </h3>
              <p className="text-xs text-slate-500 font-mono">Order #{lastCompletedOrder.orderNo}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl space-y-2 text-xs font-mono border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between border-b pb-2 text-slate-500">
                <span>Date: {new Date(lastCompletedOrder.createdAt).toLocaleTimeString()}</span>
                <span>Cashier: {lastCompletedOrder.cashierName}</span>
              </div>

              <div className="space-y-1 py-1">
                {lastCompletedOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{it.quantity}x {it.product.name}</span>
                    <span>{(it.product.price * it.quantity).toFixed(2)} บาท</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-2 space-y-1 font-sans">
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                  <span>Grand Total</span>
                  <span className="text-orange-600">{lastCompletedOrder.grandTotal.toFixed(2)} บาท</span>
                </div>
                {lastCompletedOrder.memberName && (
                  <p className="text-[10px] text-amber-600 font-semibold">
                    Loyalty Member: {lastCompletedOrder.memberName} (Points Awarded!)
                  </p>
                )}
              </div>

              {/* Anti-Tamper Signature Verification */}
              <div className="mt-3 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-[9px] text-slate-500 space-y-1 break-all border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> HMAC SHA-256 Signature (Dexie Verified)
                </div>
                <p>{lastCompletedOrder.hmacSignature}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setLastCompletedOrder(null)}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-xs hover:bg-orange-700 shadow-md"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
