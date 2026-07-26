import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, RefreshCw, UserCheck, Award } from 'lucide-react';
import { Member, Product, CartItem } from '../../types/pos';

interface GeminiAiSmartUpsellProps {
  member: Member;
  cartItems: CartItem[];
  availableProducts: Product[];
  onAddProductToCart: (product: Product) => void;
}

export const GeminiAiSmartUpsell: React.FC<GeminiAiSmartUpsellProps> = ({
  member,
  cartItems,
  availableProducts,
  onAddProductToCart,
}) => {
  const [loading, setLoading] = useState(false);
  const [upsellData, setUpsellData] = useState<{
    script: string;
    recommendedProduct: Product | null;
    reason: string;
  } | null>(null);

  const fetchAiUpsell = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: member.name,
          memberPoints: member.points,
          cartItems: cartItems.map((ci) => ({
            id: ci.product.id,
            name: ci.product.name,
            category: ci.product.category,
            price: ci.product.price,
            quantity: ci.quantity,
          })),
          availableProducts: availableProducts.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            category: p.category,
            imageUrl: p.imageUrl,
          })),
        }),
      });

      const data = await response.json();
      setUpsellData({
        script: data.script,
        recommendedProduct: data.recommendedProduct || availableProducts[0] || null,
        reason: data.reason || 'AI Loyalty pairing recommendation.',
      });
    } catch (err) {
      console.error('Error fetching Gemini AI Smart Upsell:', err);
      // Fallback
      setUpsellData({
        script: `Since ${member.name} frequently orders signature items, recommend adding Truffle Fries for 50 bonus points today!`,
        recommendedProduct: availableProducts.find((p) => p.name.includes('Truffle')) || availableProducts[0] || null,
        reason: 'Frequently paired appetizer.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (member) {
      fetchAiUpsell();
    }
  }, [member.id, cartItems.length]);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 dark:from-amber-950/30 dark:to-purple-950/30 border border-amber-300 dark:border-amber-700/50 rounded-2xl p-4 space-y-3 shadow-xs">
      {/* Member Header */}
      <div className="flex justify-between items-center pb-2 border-b border-amber-200/60 dark:border-amber-800/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{member.name}</span>
              <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                {member.tier}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              ID: {member.memberNo} • {member.points} pts available
            </p>
          </div>
        </div>

        <button
          onClick={fetchAiUpsell}
          disabled={loading}
          className="p-1.5 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
          title="Refresh AI Smart Recommendation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh AI</span>
        </button>
      </div>

      {/* Gemini AI Script Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-xl p-3 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-amber-500 to-purple-600 text-white rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3" /> Gemini 2.5/3.6 AI Cashier Script
              </span>
            </div>
            {loading ? (
              <div className="space-y-1.5 mt-1.5 animate-pulse">
                <div className="h-3 bg-amber-200/60 dark:bg-amber-800/40 rounded-sm w-full" />
                <div className="h-3 bg-amber-200/60 dark:bg-amber-800/40 rounded-sm w-3/4" />
              </div>
            ) : (
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 italic mt-1 leading-snug">
                "{upsellData?.script}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Product Card with Quick Add */}
      {upsellData?.recommendedProduct && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-3 shadow-sm hover:border-amber-500 transition-all">
          <div className="flex items-center gap-3">
            {upsellData.recommendedProduct.imageUrl ? (
              <img
                src={upsellData.recommendedProduct.imageUrl}
                alt={upsellData.recommendedProduct.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 font-bold text-lg flex items-center justify-center shrink-0">
                {upsellData.recommendedProduct.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                {upsellData.recommendedProduct.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-extrabold text-sm text-orange-600">
                  {upsellData.recommendedProduct.price.toFixed(2)} บาท
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  SKU: {upsellData.recommendedProduct.sku}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onAddProductToCart(upsellData.recommendedProduct!)}
            className="px-3 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Order</span>
          </button>
        </div>
      )}
    </div>
  );
};
