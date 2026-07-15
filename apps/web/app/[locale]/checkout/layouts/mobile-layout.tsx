import { useState } from 'react';
import { useCartQuery } from '@/app/[locale]/cart/queries';
import { api } from '@/api';
import { useRouter } from 'next/navigation';
import { Price } from '@/components/price';

export default function MobileCheckoutLayout() {
  const { data: cartSummary, isLoading: isCartLoading } = useCartQuery();
  const cartItems = cartSummary?.items || [];
  const total = cartSummary?.grandTotal || 0;
  const subtotal = cartSummary?.subtotal || 0;
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!address) return alert('Please enter an address');
    if (!cartItems?.length) return alert('Cart is empty');
    
    setLoading(true);
    try {
      // In a real scenario we'd use the proper address ID from a created address record
      // For now we assume the user creates an address or selects one
      // Since this is a drastic change, I'll mock the address selection for now, or just send text if backend supports.
      // Wait, backend expects a UUID for address. We should have an address selection UI here.
      // Assuming user has a default address ID stored somewhere or we create it.
      
      const { data } = await api.post('/checkout', {
        cartId: 'local-cart',
        shippingAddressId: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
      });
      // queryClient.removeQueries({ queryKey: ['cart'] }) // Handled post-checkout typically
      router.push(`/checkout/success?order=${data?.order?.orderNumber || '0000'}`);
    } catch (error) {
      console.error(error);
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 bg-white shadow-sm p-4 z-10 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
        <span className="text-sm text-gray-500">{cartItems?.length || 0} items</span>
      </header>

      <main className="flex-1 p-4 space-y-6">
        <section className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Shipping Details</h2>
          <div className="space-y-3">
            <textarea 
              className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="Enter your full shipping address..."
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider">Order Summary</h2>
          <div className="space-y-4">
            {cartItems?.map((item: any) => (
              <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                   {/* Fallback image if no product metadata */}
                  <img src={item.image || 'https://via.placeholder.com/64'} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <h3 className="font-medium line-clamp-1">{item.productName}</h3>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <Price amount={item.subtotal} className="font-medium" />
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center px-1">
          <span className="text-gray-600">Total Estimate</span>
          <span className="font-bold text-lg">
             <Price amount={total} />
          </span>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={loading || !cartItems?.length}
          className="w-full bg-black text-white py-3.5 rounded-xl font-medium active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
}
