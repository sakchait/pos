import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Search,
  Tag,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Product, Category } from '../../types/pos';

interface ProductManagementViewProps {
  userRole?: string;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({ userRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState('');

  // Form states
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStockThreshold, setMinStockThreshold] = useState(10);
  const [category, setCategory] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const isManager = userRole === 'Admin' || userRole === 'BranchManager';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodList, catList] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories()
      ]);
      setProducts(prodList);
      setCategories(catList);
      if (catList.length > 0 && !category) {
        setCategory(catList[0].name);
      }
    } catch (err: any) {
      setError('Failed to load products or categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setSku('');
    setName('');
    setPrice(0);
    setStock(0);
    setMinStockThreshold(10);
    if (categories.length > 0) {
      setCategory(categories[0].name);
    } else {
      setCategory('');
    }
    setIsAvailable(true);
    setError('');
  };

  const handleEditClick = (p: Product) => {
    setIsEditing(true);
    setCurrentProductId(p.id);
    setSku(p.sku);
    setName(p.name);
    setPrice(p.price);
    setStock(p.stock);
    setMinStockThreshold(p.minStockThreshold);
    setCategory(p.category);
    setIsAvailable(p.isAvailable !== false);
    setError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${p.name}?`)) return;
    try {
      await apiService.deleteProduct(p.id);
      setSuccess('Product deleted successfully!');
      loadData();
    } catch (err: any) {
      setError('Failed to delete product.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      setError('SKU/Code and Name are required.');
      return;
    }
    if (price < 0 || stock < 0) {
      setError('Price and Stock cannot be negative.');
      return;
    }

    try {
      setError('');
      if (isEditing) {
        await apiService.updateProduct(currentProductId, {
          sku: sku.trim(),
          name: name.trim(),
          price,
          stock,
          minStockThreshold,
          category,
          isAvailable
        });
        setSuccess('Product updated successfully!');
      } else {
        await apiService.createProduct({
          sku: sku.trim(),
          name: name.trim(),
          price,
          stock,
          minStockThreshold,
          category,
          isAvailable
        });
        setSuccess('Product registered successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error saving product details.');
    }
  };

  // Metrics
  const totalCount = products.length;
  const lowStockCount = products.filter(p => p.stock <= p.minStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const avgPrice = totalCount > 0 ? products.reduce((sum, p) => sum + p.price, 0) / totalCount : 0;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const displayedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            <span>Product Catalog Management</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Create, update, search, and delete menu items, inventory thresholds, and categorize stock offerings.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              handleClearForm();
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Product</span>
          </button>
        )}
      </div>

      {/* Success/Error Banner */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900 p-3.5 rounded-2xl text-xs text-emerald-800 dark:text-emerald-400 font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 rounded-2xl text-xs text-rose-800 dark:text-rose-400 font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-xl shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Products</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Low Stock items</p>
            <p className="text-2xl font-extrabold mt-1 text-yellow-600 dark:text-yellow-500">{lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Out of Stock</p>
            <p className="text-2xl font-extrabold mt-1 text-rose-600 dark:text-rose-505">{outOfStockCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Price</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">${avgPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Filter Controls */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:max-w-xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-455 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by SKU or Product Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-455 whitespace-nowrap">
            Showing {filteredProducts.length} of {totalCount} total items
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading Product Catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No products found.</p>
              <p className="text-xs text-slate-400">Try matching different query criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-455 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                  <th className="py-2 px-4 pl-6">SKU / Code</th>
                  <th className="py-2 px-4">Product Name</th>
                  <th className="py-2 px-4">Category</th>
                  <th className="py-2 px-4 text-right">Price</th>
                  <th className="py-2 px-4 text-center">Stock Count</th>
                  <th className="py-2 px-4 text-center">Status</th>
                  {isManager && <th className="py-2 px-4 pr-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {displayedProducts.map((p) => {
                  const isLow = p.stock <= p.minStockThreshold && p.stock > 0;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                      <td className="py-2 px-4 pl-6 font-mono font-bold text-slate-700 dark:text-slate-300">{p.sku}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} className="w-8 h-8 rounded-lg object-cover" alt="" />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 uppercase">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-extrabold text-orange-655 dark:text-orange-500">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono font-bold ${isOut ? 'text-rose-600' : isLow ? 'text-yellow-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {p.stock} units
                          </span>
                          {isOut && <span className="text-[8px] uppercase font-bold text-rose-500">Out of Stock</span>}
                          {isLow && <span className="text-[8px] uppercase font-bold text-yellow-550">Low Stock Alert</span>}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${p.isAvailable !== false ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {p.isAvailable !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Unavailable</span>
                            </>
                          )}
                        </span>
                      </td>
                      {isManager && (
                        <td className="py-2 px-4 pr-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                              title="Edit details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(p)}
                              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-955/30 text-rose-650 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Items per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl w-full max-w-lg shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isEditing ? 'Update Product Details' : 'Register New Product'}
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5">
                  Specify details such as menu SKU, title pricing, stock limits, and target category.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Product SKU / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. 0087"
                    disabled={isEditing}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. mixed grill platter"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Min Stock Limit
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Category Name
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                    Catalog Availability
                  </label>
                  <div className="flex items-center h-[34px]">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                        Available in POS Menu
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl font-bold text-xs shadow-md"
                >
                  {isEditing ? 'Save Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
