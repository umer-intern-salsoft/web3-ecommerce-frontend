import { useState, useEffect } from 'react';
import { fetchApi } from '../api';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', imageUrl: '', priceUsd: '', stockQuantity: ''
  });

  // Dedicated function for manual refreshes after creating/updating
  const loadProducts = async () => {
    try {
      const data = await fetchApi('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Safe fetch initialized inside the effect for the initial mount
  useEffect(() => {
    let isMounted = true; 

    const fetchInitialData = async () => {
      try {
        const data = await fetchApi('/products');
        // State is only set asynchronously after the network request resolves
        if (isMounted) {
          setProducts(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();

    // Cleanup function to prevent memory leaks if the component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          priceUsd: parseFloat(formData.priceUsd),
          stockQuantity: parseInt(formData.stockQuantity, 10)
        })
      });
      setFormData({ name: '', description: '', imageUrl: '', priceUsd: '', stockQuantity: '' });
      loadProducts(); // Call the manual refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateProduct = async (event, id) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await fetchApi(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          priceUsd: parseFloat(form.get('priceUsd')),
          stockQuantity: parseInt(form.get('stockQuantity'), 10)
        })
      });
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Create Product Form */}
        <section className="bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4">Add New Product</h2>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            <input type="text" placeholder="Product Name" required className="w-full p-2 border rounded"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            
            <textarea placeholder="Description" required className="w-full p-2 border rounded"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            
            <input type="url" placeholder="Image URL" required className="w-full p-2 border rounded"
              value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <input type="number" min="0.01" step="0.01" placeholder="Price (USD)" required className="w-full p-2 border rounded"
                value={formData.priceUsd} onChange={e => setFormData({...formData, priceUsd: e.target.value})} />
              <input type="number" placeholder="Stock Qty" required className="w-full p-2 border rounded"
                value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
            </div>
            
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Create Product
            </button>
          </form>
        </section>

        {/* Inventory Management */}
        <section>
          <h2 className="text-xl font-bold mb-4">Manage Inventory</h2>
          <div className="space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-gray-500">${Number(product.priceUsd).toFixed(2)}</p>
                </div>
                <form onSubmit={(event) => handleUpdateProduct(event, product.id)} className="mt-3 flex flex-wrap items-end gap-2">
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-gray-500">USD price</span>
                    <input 
                      name="priceUsd"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="w-28 p-2 border rounded" 
                      defaultValue={product.priceUsd}
                    />
                  </label>
                  <label className="text-sm">
                    <span className="mb-1 block text-xs text-gray-500">Stock</span>
                  <input 
                    name="stockQuantity"
                    type="number" 
                    min="0"
                    className="w-20 p-2 border rounded" 
                    defaultValue={product.stockQuantity}
                  />
                  </label>
                  <button type="submit" className="rounded bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    Save
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}