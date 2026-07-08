import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DesktopCheckoutLayout() {
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b py-6 px-10 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-2xl font-light tracking-wide">LONDON KOLLECTION</h1>
        <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Checkout</div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-8 flex gap-12">
        {/* Left Column: Form */}
        <div className="flex-1 space-y-10">
          <div>
            <h2 className="text-3xl font-light mb-6">Shipping Information</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
              <textarea 
                className="w-full border-b-2 border-gray-200 bg-transparent py-3 focus:border-black transition-colors outline-none resize-none"
                placeholder="Enter your full street address, apartment, city, and zip code..."
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
             <h3 className="font-medium text-blue-900 mb-2">Manual Payment Process</h3>
             <p className="text-sm text-blue-800/80 leading-relaxed">
               For security and personalized service, we are currently processing payments manually. 
               Once you confirm your order, it will be placed in a pending state. 
               Our team will contact you shortly to complete the payment securely.
             </p>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-[420px] shrink-0">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-32">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems?.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden">
                    <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 py-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-right">
                      ${((Number(item.price) || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-8 pt-6 space-y-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${cartItems?.reduce((acc: any, item: any) => acc + (Number(item.price) || 0) * item.quantity, 0).toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              <div className="flex justify-between text-lg font-medium pt-4 border-t">
                <span>Total</span>
                <span>${cartItems?.reduce((acc: any, item: any) => acc + (Number(item.price) || 0) * item.quantity, 0).toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={loading || !cartItems?.length}
              className="w-full bg-black text-white py-4 rounded-xl font-medium text-lg mt-8 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
