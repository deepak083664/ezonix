import React, { useEffect, useState } from 'react';
import API, { BACKEND_URL } from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Package, Layers, Image as ImageIcon, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // For category create
  const [newCatName, setNewCatName] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await API.get('/products/categories');
      setCategories(res.data.data.categories);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategoryFilter ? `&category=${selectedCategoryFilter}` : '';
      const lowStockParam = lowStockFilter ? `&lowStock=true` : '';
      const res = await API.get(
        `/products?search=${searchQuery}${categoryParam}${lowStockParam}&page=${page}&limit=10`
      );
      setProducts(res.data.data.products);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategoryFilter, lowStockFilter, page]);

  const handleCreateOrUpdate = async (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('quantity', data.quantity);
    formData.append('lowStockThreshold', data.lowStockThreshold);
    if (data.sku) formData.append('sku', data.sku);
    if (imageFile) formData.append('image', imageFile);

    try {
      if (selectedProduct) {
        await API.patch(`/products/${selectedProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated successfully!');
      } else {
        await API.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product added successfully!');
      }
      setIsFormOpen(false);
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await API.delete(`/products/${selectedProduct._id}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await API.post('/products/categories', { name: newCatName });
      toast.success('Category created!');
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await API.delete(`/products/categories/${catId}`);
      toast.success('Category deleted!');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete. Categories may be in use.');
    }
  };

  const openFormModal = (product = null) => {
    setSelectedProduct(product);
    setImageFile(null);
    if (product) {
      setValue('name', product.name);
      setValue('sku', product.sku);
      setValue('category', product.category?._id || '');
      setValue('price', product.price);
      setValue('quantity', product.quantity);
      setValue('lowStockThreshold', product.lowStockThreshold);
    } else {
      reset();
    }
    setIsFormOpen(true);
  };

  const openConfirmModal = (product) => {
    setSelectedProduct(product);
    setIsConfirmOpen(true);
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img
              src={row.image.startsWith('http') ? row.image : `${BACKEND_URL}${row.image}`}
              alt={val}
              className="h-10 w-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
            />
          ) : (
            <div className="rounded-lg bg-slate-100 p-2 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Package size={20} />
            </div>
          )}
          <div>
            <span className="font-semibold text-slate-850 dark:text-slate-200 block">
              {val}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              SKU: {row.sku}
            </span>
          </div>
        </div>
      ),
    },
    { header: 'Category', accessor: 'category', render: (val) => val?.name || '-' },
    { header: 'Price', accessor: 'price', render: (val) => `$${val.toFixed(2)}` },
    {
      header: 'Stock Quantity',
      accessor: 'quantity',
      render: (val, row) => {
        const isLow = val <= row.lowStockThreshold;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isLow
                ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                : 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
            }`}
          >
            {isLow && <ShieldAlert size={12} />}
            {val} in stock
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openFormModal(row)}
            title="Edit Product"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => openConfirmModal(row)}
            title="Delete Product"
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title / Action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Product Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Catalog stock counts, categories, pricing, and upload images.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Layers size={16} /> Categories
          </button>
          <button
            onClick={() => openFormModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {/* Category filter select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockFilter}
            onChange={(e) => setLowStockFilter(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-800"
          />
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Show Low Stock Alerts Only
          </span>
        </label>
      </div>

      {/* Table grid */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchPlaceholder="Search products by name, SKU..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={Package}
            title="No Products Found"
            message="No records match the current criteria. Start by registering item models."
            actionText="Add Product"
            onAction={() => openFormModal()}
          />
        }
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProduct ? 'Edit Product Item' : 'Register New Product'}
      >
        <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Product Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Product name is required' })}
              className="form-input"
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Custom SKU (Leave empty to auto-generate)
              </label>
              <input type="text" {...register('sku')} className="form-input" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="form-input"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { required: 'Price is required' })}
                className="form-input"
              />
              {errors.price && <span className="text-xs text-red-500">{errors.price.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                {...register('quantity', { required: 'Quantity is required' })}
                className="form-input"
              />
              {errors.quantity && <span className="text-xs text-red-500">{errors.quantity.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                defaultValue={5}
                {...register('lowStockThreshold')}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Product Image
            </label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 select-none">
                <ImageIcon size={14} /> Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 1 * 1024 * 1024) {
                        toast.error('Image size cannot exceed 1MB.');
                        e.target.value = '';
                        return;
                      }
                      setImageFile(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-400 truncate max-w-xs">
                {imageFile ? imageFile.name : selectedProduct?.image ? 'Change current image' : 'No image selected'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
            >
              {selectedProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete ${selectedProduct?.name}? This cannot be undone.`}
      />

      {/* Manage Categories Modal */}
      <Modal isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} title="Manage Categories">
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              placeholder="Category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="form-input flex-1"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Add
            </button>
          </form>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between border border-slate-100 rounded-lg p-3 dark:border-slate-850"
              >
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {cat.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-4">No categories registered.</p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsCategoryOpen(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
