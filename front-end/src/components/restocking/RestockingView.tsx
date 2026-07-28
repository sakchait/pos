import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  FilePlus,
  CheckCircle,
  XCircle,
  Clock,
  PackageCheck,
  Building,
  Inbox
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Product, ProposedPO } from '../../types/pos';

interface RestockingViewProps {
  userRole: string;
}

export const RestockingView: React.FC<RestockingViewProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [proposedPOs, setProposedPOs] = useState<ProposedPO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [vendorName, setVendorName] = useState<string>('Gourmet Supply Distributors');

  const vendors = [
    'Fresh Harvest Farms Co.',
    'Gourmet Supply Distributors',
    'Global Food Logistics',
    'Beverage World Imports'
  ];

  useEffect(() => {
    loadRestockingData();
  }, []);

  // Update cost when product selection changes
  useEffect(() => {
    const prod = products.find(p => p.id === selectedProductId);
    if (prod) {
      setUnitCost(prod.price * 0.45); // default standard cost is approx 45% of retail price
    }
  }, [selectedProductId, products]);

  const loadRestockingData = async () => {
    try {
      setIsLoading(true);
      const allProds = await apiService.getProducts();
      setProducts(allProds);
      
      const lowStock = allProds.filter(p => p.stock <= p.minStockThreshold);
      setLowStockProducts(lowStock);

      if (allProds.length > 0 && !selectedProductId) {
        setSelectedProductId(allProds[0].id);
      }

      const pos = await apiService.getProposedPOs();
      setProposedPOs(pos.reverse());
    } catch (e) {
      console.error('Error loading restocking data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = products.find(p => p.id === selectedProductId);
    if (!targetProd) return;

    const totalCost = quantity * unitCost;
    const poNumber = `PO-RESTOCK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPO: ProposedPO = {
      id: `po-${Date.now()}`,
      poNumber,
      vendorName,
      vendorContact: 'orders@restocksupplier.com',
      items: [
        {
          productId: targetProd.id,
          productName: targetProd.name,
          proposedQty: quantity,
          unitCost,
        }
      ],
      totalCost,
      status: 'PROPOSED',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    try {
      await apiService.addProposedPO(newPO);
      await loadRestockingData();
    } catch (e) {
      console.error('Failed to submit restocking PO:', e);
    }
  };

  const handleReceiveStock = async (po: ProposedPO) => {
    try {
      await apiService.updateProposedPO(po.id, {
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: 'BranchManager',
      });
      await loadRestockingData();
    } catch (e) {
      console.error('Failed to receive stock batch:', e);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Branch Restocking Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit fresh POs directly from this branch • Monitor pending shipments • Receive stock immediately into inventory
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 rounded-full font-extrabold text-xs">
          Role: {userRole}
        </span>
      </div>

      {/* Grid of form and overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form & Trigger Alerts */}
        <div className="space-y-8 lg:col-span-1">
          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Branch Stock Alerts</h3>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-2xl text-center">
                All branch items are well stocked!
              </div>
            ) : (
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/60 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-[9px] text-slate-400">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-rose-600 block">{p.stock} remaining</span>
                      <span className="text-[9px] text-slate-400">Min: {p.minStockThreshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PO Creation Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FilePlus className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Direct Restock Form</h3>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Select Product</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.stock} left)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Preferred Supplier</label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                >
                  {vendors.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Unit Cost (Est.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400">฿</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={unitCost.toFixed(2)}
                      onChange={e => setUnitCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-500">Estimated Total Cost:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  ฿{(quantity * unitCost).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>SUBMIT RESTOCK PO</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: PO History Log */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Restocking PO Logs</h3>
              </div>
              <button
                onClick={loadRestockingData}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center items-center">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : proposedPOs.length === 0 ? (
              <div className="py-20 flex flex-col justify-center items-center text-slate-400 space-y-3">
                <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <span className="text-xs">No purchase orders found for this branch.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-2">PO Number</th>
                      <th className="py-3 px-2">Date / Supplier</th>
                      <th className="py-3 px-2">Restock Items</th>
                      <th className="py-3 px-2">Total Amount</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {proposedPOs.map(po => {
                      const isProposed = po.status === 'PROPOSED';
                      const isApproved = po.status === 'APPROVED';
                      const isRejected = po.status === 'REJECTED';

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-4 px-2 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {po.poNumber}
                          </td>
                          <td className="py-4 px-2 space-y-0.5">
                            <span className="font-semibold block text-slate-900 dark:text-slate-100">{po.vendorName}</span>
                            <span className="text-[10px] text-slate-400 block">{po.createdAt}</span>
                          </td>
                          <td className="py-4 px-2 space-y-1">
                            {po.items.map((item, index) => (
                              <div key={index} className="text-slate-600 dark:text-slate-400">
                                {item.productName}{' '}
                                <span className="font-bold text-orange-600">x{item.proposedQty}</span>
                              </div>
                            ))}
                          </td>
                          <td className="py-4 px-2 font-mono font-bold text-slate-950 dark:text-slate-50">
                            ฿{po.totalCost.toFixed(2)}
                          </td>
                          <td className="py-4 px-2">
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-flex items-center gap-1 ${
                                isApproved
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                  : isRejected
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {isApproved ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : isRejected ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3 animate-pulse" />
                              )}
                              {po.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            {isProposed && (userRole === 'BranchManager' || userRole === 'Admin') ? (
                              <button
                                onClick={() => handleReceiveStock(po)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] flex items-center gap-1 ml-auto shadow-sm active:scale-98 transition-all cursor-pointer"
                              >
                                <PackageCheck className="w-3 h-3" />
                                <span>Receive Stock</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">None</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
