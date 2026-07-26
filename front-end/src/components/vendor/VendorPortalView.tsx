import React, { useState, useEffect } from 'react';
import {
  Truck,
  AlertTriangle,
  FilePlus,
  CheckCircle,
  XCircle,
  PackageCheck,
  Layers,
  Building2,
  DollarSign,
  Send,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Product, ProposedPO, StockBatch } from '../../types/pos';

interface VendorPortalViewProps {
  userRole: string;
}

export const VendorPortalView: React.FC<VendorPortalViewProps> = ({ userRole }) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [proposedPOs, setProposedPOs] = useState<ProposedPO[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);

  // Form State for Proposed PO Creation
  const [vendorName, setVendorName] = useState<string>('Fresh Harvest Farms Co.');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [proposedQty, setProposedQty] = useState<number>(50);
  const [unitCost, setUnitCost] = useState<number>(5.5);

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    const products = await apiService.getProducts();
    const lowStock = products.filter((p) => p.stock <= p.minStockThreshold);
    setLowStockProducts(lowStock);

    if (lowStock.length > 0 && !selectedProductId) {
      setSelectedProductId(lowStock[0].id);
    }

    const pos = await apiService.getProposedPOs();
    setProposedPOs(pos.reverse());

    const batches = await apiService.getStockBatches();
    setStockBatches(batches.reverse());
  };

  const handleCreateProposedPO = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = lowStockProducts.find((p) => p.id === selectedProductId) || (await apiService.getProducts()).find(p => p.id === selectedProductId);
    if (!targetProd) return;

    const totalCost = proposedQty * unitCost;
    const poNo = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPO: ProposedPO = {
      id: `po-${Date.now()}`,
      poNumber: poNo,
      vendorName,
      vendorContact: 'orders@freshharvest.com',
      items: [
        {
          productId: targetProd.id,
          productName: targetProd.name,
          proposedQty,
          unitCost,
        },
      ],
      totalCost,
      status: 'PROPOSED',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    await apiService.addProposedPO(newPO);
    await loadVendorData();
  };

  const handlePurchaserApprovePO = async (po: ProposedPO) => {
    // 1. Mark PO as APPROVED
    await apiService.updateProposedPO(po.id, {
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvedBy: 'PurchaserManager',
    });

    // 2. Update Product Inventory Stock in Dexie / Server
    for (const item of po.items) {
      const allProds = await apiService.getProducts();
      const prod = allProds.find(p => p.id === item.productId);
      if (prod) {
        await apiService.updateProduct(item.productId, {
          stock: prod.stock + item.proposedQty,
        });

        // 3. Insert new FIFO StockBatch
        const batchNo = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
          100 + Math.random() * 900
        )}`;

        const newBatch: StockBatch = {
          id: `batch-${Date.now()}`,
          productId: item.productId,
          productName: item.productName,
          batchNo,
          qtyReceived: item.proposedQty,
          qtyRemaining: item.proposedQty,
          unitCost: item.unitCost,
          receivedDate: new Date().toISOString().split('T')[0],
          poNumber: po.poNumber,
        };

        await apiService.addStockBatch(newBatch);
      }
    }

    await loadVendorData();
  };

  const handleRejectPO = async (poId: string) => {
    await apiService.updateProposedPO(poId, { status: 'REJECTED' });
    await loadVendorData();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Vendor Portal & FIFO Purchasing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Low-Stock threshold alerts • Proposed PO creation • Purchaser Manager approval & FIFO Stock Batches
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full font-extrabold text-xs">
          Role: {userRole}
        </span>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low-Stock Alerting Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Low-Stock Trigger Alerts</h3>
          </div>

          <p className="text-xs text-slate-500">Items where currentStock ≤ minStockThreshold:</p>

          {lowStockProducts.length === 0 ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 text-xs font-bold rounded-2xl text-center">
              All warehouse product stocks are optimal.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</p>
                    <p className="text-[10px] text-slate-400">SKU: {p.sku} • Category: {p.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-rose-600 block">{p.stock} units left</span>
                    <span className="text-[9px] text-slate-400">Threshold: {p.minStockThreshold}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Proposed PO Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FilePlus className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Create Proposed Purchase Order (Vendor)</h3>
          </div>

          <form onSubmit={handleCreateProposedPO} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vendor Name</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Low-Stock Target Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              >
                {lowStockProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proposed Restock Qty</label>
              <input
                type="number"
                min="1"
                required
                value={proposedQty}
                onChange={(e) => setProposedQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proposed Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Send className="w-4 h-4" /> Submit Proposed PO to Purchaser
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PO Approval & FIFO Stock Batches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* POs List */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Proposed PO Approval (Purchaser Manager)
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {proposedPOs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No purchase orders created.</p>
            ) : (
              proposedPOs.map((po) => (
                <div
                  key={po.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{po.poNumber}</p>
                      <p className="text-xs text-slate-500">{po.vendorName} • {po.createdAt}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        po.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : po.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700/60 pt-2 space-y-1">
                    {po.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span>
                          {it.productName} ({it.proposedQty} units @ ${it.unitCost.toFixed(2)})
                        </span>
                        <span className="font-bold">${(it.proposedQty * it.unitCost).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {po.status === 'PROPOSED' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handlePurchaserApprovePO(po)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Insert FIFO Batch
                      </button>
                      <button
                        onClick={() => handleRejectPO(po.id)}
                        className="py-2 px-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* FIFO Stock Batches Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" /> FIFO Warehouse Inventory Stock Batches
          </h3>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Batch No</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Qty Remaining</th>
                  <th className="p-3">Unit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stockBatches.map((sb) => (
                  <tr key={sb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono text-purple-600 font-bold">{sb.batchNo}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{sb.productName}</td>
                    <td className="p-3 font-extrabold text-slate-800 dark:text-slate-200">
                      {sb.qtyRemaining} / {sb.qtyReceived}
                    </td>
                    <td className="p-3 font-mono">${sb.unitCost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
