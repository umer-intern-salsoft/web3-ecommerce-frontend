import { useState, useEffect } from 'react';
import { fetchApi } from '../api';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', imageUrl: '', priceEth: '', stockQuantity: ''
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
          priceEth: parseFloat(formData.priceEth),
          stockQuantity: parseInt(formData.stockQuantity, 10)
        })
      });
      setFormData({ name: '', description: '', imageUrl: '', priceEth: '', stockQuantity: '' });
      loadProducts(); // Call the manual refresh
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await fetchApi(`/products/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ stockQuantity: parseInt(newStock, 10) })
      });
      loadProducts(); // Call the manual refresh
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
              <input type="number" step="0.0001" placeholder="Price (ETH)" required className="w-full p-2 border rounded"
                value={formData.priceEth} onChange={e => setFormData({...formData, priceEth: e.target.value})} />
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
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.priceEth} ETH</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Stock:</label>
                  <input 
                    type="number" 
                    className="w-20 p-1 border rounded" 
                    defaultValue={product.stockQuantity}
                    onBlur={(e) => handleUpdateStock(product.id, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}