'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: string[];
}

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export default function MerchandisePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/products')
      .then(res => res.ok ? res.json() : [])
      .then(data => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  const addToCart = (product: Product, size?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === size
      );
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedSize === size)));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total }),
      });
      if (res.ok) {
        alert('Order placed successfully! You will receive a confirmation SMS.');
        setCart([]);
        setShowCart(false);
      }
    } catch {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <p className="text-gray-500">Loading merchandise...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Campaign Merchandise</h1>
          <div className="text-5xl mb-4">🏪</div>
          <p className="text-gray-500">Merchandise coming soon! Check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Campaign Merchandise</h1>
          <p className="text-gray-600">Wear the vision. Show your support.</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? 'bg-brand-green text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-yellow'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-4">
                <span className="text-5xl">{product.image}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.name}</h3>
              <p className="text-brand-green font-bold mb-3">KES {product.price.toLocaleString()}</p>
              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => addToCart(product, size)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-brand-yellow/10 hover:border-brand-yellow"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="btn-primary w-full text-sm py-2"
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 max-w-[calc(100vw-2rem)] bg-brand-green text-white rounded-full py-3 px-5 shadow-xl hover:bg-brand-greenlt transition-all z-40 text-sm font-bold truncate"
          >
            🛒 {cart.reduce((sum, item) => sum + item.quantity, 0)} items · KES {total.toLocaleString()}
          </button>
        )}

        {/* Cart Drawer */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <div className="relative bg-white w-full max-w-md h-full overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.selectedSize && (
                      <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">KES {(item.price * item.quantity).toLocaleString()}</p>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} className="bg-brand-green hover:bg-brand-greenlt text-white font-bold rounded-lg w-full py-4 text-lg">
                  Checkout via M-Pesa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
