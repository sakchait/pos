import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Category } from '../../types/pos';

interface CategoryManagementViewProps {
  userRole?: string;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({ userRole }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState('');

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const isManager = userRole === 'Admin' || userRole === 'BranchManager';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const list = await apiService.getCategories();
      setCategories(list);
    } catch (err: any) {
      setError('Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setCode('');
    setName('');
    setError('');
  };

  const handleEditClick = (c: Category) => {
    setIsEditing(true);
    setCurrentCategoryId(c.id);
    setCode(c.code);
    setName(c.name);
    setError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (c: Category) => {
    if (!window.confirm(`Are you sure you want to delete ${c.name} category?`)) return;
    try {
      await apiService.deleteCategory(c.id);
      setSuccess('Category deleted successfully!');
      loadCategories();
    } catch (err: any) {
      setError('Failed to delete category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError('Category Code and Name are required.');
      return;
    }

    try {
      setError('');
      if (isEditing) {
        await apiService.updateCategory(currentCategoryId, {
          code: code.trim().toUpperCase(),
          name: name.trim()
        });
        setSuccess('Category updated successfully!');
      } else {
        await apiService.createCategory({
          code: code.trim().toUpperCase(),
          name: name.trim()
        });
        setSuccess('Category created successfully!');
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Error saving category details.');
    }
  };

  const totalCount = categories.length;

  const filteredCategories = categories.filter(c => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const displayedCategories = filteredCategories.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-orange-600" />
            <span>Product Category Management</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Configure product departments, categorization tags, and inventory groups.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              handleClearForm();
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-950 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category Group</span>
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

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-xl shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Categories</p>
            <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 rounded-xl shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Default Department</p>
            <p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">Beverages (BEV)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Status</p>
            <p className="text-xl font-bold mt-1 text-slate-800 dark:text-slate-100">All Configured</p>
          </div>
        </div>
      </div>

      {/* Category List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-455 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code or category name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="text-xs text-slate-455">
            Showing {filteredCategories.length} of {totalCount} registered groups
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading Category List...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No category groups found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800">
                  <th className="p-4 pl-6">Category Code</th>
                  <th className="p-4">Category Name</th>
                  {isManager && <th className="p-4 pr-6 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {displayedCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-955/20 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-700 dark:text-slate-300">{c.code}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                    {isManager && (
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(c)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                            title="Edit details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(c)}
                            className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-955/30 text-rose-650 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
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
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {isEditing ? 'Update Category Group' : 'Add Category Group'}
                </h3>
                <p className="text-[10px] text-slate-450 mt-0.5">
                  Configure department title groups and unique coding prefixes.
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
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                  Category Code
                </label>
                <input
                  type="text"
                  maxLength={5}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. COF"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Coffee / Hot Brews"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
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
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
