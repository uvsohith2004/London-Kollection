import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TabLayout() {
  // Similar to desktop but slightly adjusted for tablet screens
  const { items: cartItems, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!address) return alert('Please enter an address');
    if (!cartItems?.length) return alert('Cart is empty');
    
    setLoading(true);
    try {
      const { data } = await api.post('/checkout', {
        cartId: 'local-cart',
        shippingAddressId: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
      });
      clearCart();
      router.push(`/checkout/success?order=${data?.order?.orderNumber || '0000'}`);
    } catch (error) {
      console.error(error);
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-medium tracking-wide">Checkout</h1>
        </header>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b">
            <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
            <textarea 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 focus:border-black focus:ring-1 focus:ring-black transition-all outline-none resize-none"
                placeholder="Enter your full street address, apartment, city, and zip code..."
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
          </div>

          <div className="p-8 bg-gray-50/50">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cartItems?.map((item: any) => (
                <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    <img src={item.imageUrl || 'https://via.placeholder.com/64'} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      ${((Number(item.price) || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
               <div className="flex justify-between text-xl font-medium mb-8">
                <span>Total</span>
                <span>${cartItems?.reduce((acc: any, item: any) => acc + (Number(item.price) || 0) * item.quantity, 0).toFixed(2) || '0.00'}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={loading || !cartItems?.length}
                className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
