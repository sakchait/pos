import React, { useState, useEffect } from 'react';
import {
  Layers,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Package,
  TrendingDown,
  ClipboardList,
  RotateCw,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Product, StockBatch } from '../../types/pos';

export const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const prodList = await apiService.getProducts();
      setProducts(prodList);

      const batchList = await apiService.getStockBatches();
      setStockBatches(batchList.reverse());
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Beverages', 'Appetizers', 'Main Course', 'Desserts'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate statistics
  const totalProducts = products.length;
  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Manrope'] font-bold text-2xl text-slate-900 dark:text-slate-100">
              Warehouse Inventory Control
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor real-time product stock levels, view low stock alerts, and track FIFO lots.
            </p>
          </div>
        </div>

        <button
          onClick={loadInventoryData}
          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SKUs</p>
            <p className="font-['Manrope'] text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stock</p>
            <p className="font-['Manrope'] text-xl font-extrabold text-slate-900 dark:text-slate-100">{totalStockItems} units</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</p>
            <p className="font-['Manrope'] text-xl font-extrabold text-amber-600">{lowStockCount} SKUs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <p className="font-['Manrope'] text-xl font-extrabold text-rose-600">{outOfStockCount} SKUs</p>
          </div>
        </div>
      </div>

      {/* Main Inventory Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Inventory Table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Stock Levels</h3>
              <p className="text-xs text-slate-500">Real-time stock database lookup</p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Product Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-1.5 px-3">SKU</th>
                  <th className="py-1.5 px-3">Product Name</th>
                  <th className="py-1.5 px-3">Category</th>
                  <th className="py-1.5 px-3">Unit Price</th>
                  <th className="py-1.5 px-3">Current Stock</th>
                  <th className="py-1.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-1.5 px-3 text-center text-slate-400">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-1.5 px-3 text-center text-slate-400">
                      No products found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    let statusLabel = 'Optimal';
                    let statusClass = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
                    let Icon = CheckCircle;

                    if (p.stock === 0) {
                      statusLabel = 'Out of Stock';
                      statusClass = 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
                      Icon = XCircle;
                    } else if (p.stock <= p.minStockThreshold) {
                      statusLabel = 'Low Stock';
                      statusClass = 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
                      Icon = AlertTriangle;
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-1.5 px-3 font-mono font-bold text-slate-500">{p.sku}</td>
                        <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                        <td className="py-1.5 px-3 text-slate-500 font-medium">{p.category}</td>
                        <td className="py-1.5 px-3 font-mono font-semibold">{p.price.toFixed(2)} บาท</td>
                        <td className="py-1.5 px-3 font-mono font-extrabold text-sm text-slate-800 dark:text-slate-200">
                          {p.stock} <span className="text-[10px] text-slate-400 font-normal">units</span>
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${statusClass}`}>
                            <Icon className="w-3 h-3" />
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: FIFO Batches */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">FIFO Stock Lots</h3>
          </div>
          <p className="text-xs text-slate-500">
            Active product inventory lots tracked via First-In, First-Out (FIFO) costing method.
          </p>

          <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading lots...</p>
            ) : stockBatches.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No stock lots found.</p>
            ) : (
              stockBatches.map((sb) => (
                <div
                  key={sb.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{sb.batchNo}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Rec: {sb.receivedDate}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{sb.productName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      PO Reference: {sb.poNumber}
                    </p>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400">Qty Remaining:</span>
                    <span className="font-extrabold font-mono text-slate-800 dark:text-slate-200">
                      {sb.qtyRemaining} / {sb.qtyReceived} units
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Unit Cost:</span>
                    <span className="font-bold font-mono text-emerald-600">
                      {sb.unitCost.toFixed(2)} บาท
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
