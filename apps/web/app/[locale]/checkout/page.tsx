'use client';

import { useState, useEffect } from 'react';
import { useCartQuery } from '@/app/[locale]/cart/queries';
import { fetchCheckoutPreview, submitCheckout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AddressForm } from './components/address-form';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { CheckoutStepper } from './components/checkout-stepper';
import { useAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation } from './queries';
import { cn } from '@workspace/ui/lib/utils';
import { useSettings } from "@/components/providers/settings-provider";
import { Price } from "@/components/price";

const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  governorate: z.string().min(1, 'Governorate is required'),
  area: z.string().min(1, 'Area is required'),
  block: z.string().min(1, 'Block is required'),
  street: z.string().min(1, 'Street is required'),
  building: z.string().min(1, 'Building is required'),
  floorFlat: z.string().optional(),
  landmark: z.string().optional(),
});

const checkoutSchema = z.object({
  shipping: addressSchema,
  billingSameAsShipping: z.boolean(),
  billing: z.any().optional(),
}).superRefine((data, ctx) => {
  if (!data.billingSameAsShipping) {
    const result = addressSchema.safeParse(data.billing);
    if (!result.success) {
      result.error.issues.forEach(issue => {
        ctx.addIssue({
          ...issue,
          path: ['billing', ...issue.path]
        });
      });
    }
  }
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const STEPS = ["Cart", "Delivery Details", "Payment"];

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  
  const { data: cartSummary, isLoading: isCartLoading } = useCartQuery();
  const { data: addresses, isLoading: isAddressesLoading } = useAddressesQuery();
  const createAddr = useCreateAddressMutation();
  const updateAddr = useUpdateAddressMutation();

  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null);

  const { settings } = useSettings();
  const currencyCode = settings.defaultCurrency || "KWD";

  const router = useRouter();

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      billingSameAsShipping: true,
      shipping: {
        governorate: '',
      }
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (cartSummary?.id) {
      fetchCheckoutPreview({
        cartId: cartSummary.id,
        shippingCountryCode: 'Kuwait'
      }).then(res => setPreview(res))
        .catch(err => toast.error("Failed to load tax information."));
    }
  }, [cartSummary?.id]);

  if (!mounted || isCartLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const cartItems = cartSummary?.items || [];
  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-light mb-4">Your cart is empty</h2>
        <button onClick={() => router.push('/collections')} className="bg-foreground text-background hover:bg-foreground/90 transition-all rounded-2xl h-12 px-8 font-medium uppercase tracking-widest flex items-center justify-center">
          Continue Shopping
        </button>
      </div>
    );
  }

  const handleSelectAddress = (addr: any) => {
    setSelectedShippingAddressId(addr.id);
    let parsed = { block: '', street: '', building: '', floorFlat: '' };
    try {
      parsed = JSON.parse(addr.addressLine1);
    } catch (e) {
      // fallback if not valid JSON
    }
    methods.setValue('shipping.name', addr.name, { shouldValidate: true });
    methods.setValue('shipping.phone', addr.phone, { shouldValidate: true });
    methods.setValue('shipping.governorate', addr.state, { shouldValidate: true });
    methods.setValue('shipping.area', addr.city, { shouldValidate: true });
    methods.setValue('shipping.landmark', addr.landmark || '', { shouldValidate: true });
    methods.setValue('shipping.block', parsed.block || '', { shouldValidate: true });
    methods.setValue('shipping.street', parsed.street || '', { shouldValidate: true });
    methods.setValue('shipping.building', parsed.building || '', { shouldValidate: true });
    methods.setValue('shipping.floorFlat', parsed.floorFlat || '', { shouldValidate: true });
  };

  const handleAddNewAddress = () => {
    setSelectedShippingAddressId(null);
    methods.reset({
      billingSameAsShipping: methods.getValues('billingSameAsShipping'),
      shipping: { governorate: '', area: '', block: '', street: '', building: '', floorFlat: '', landmark: '', name: '', phone: '' }
    });
  };

  const handlePlaceOrder = async (data: CheckoutFormValues) => {
    setLoading(true);
    try {
      // 1. Process Shipping Address
      let finalShippingId = selectedShippingAddressId;
      
      const shippingPayload = {
        name: data.shipping.name,
        phone: data.shipping.phone,
        country: 'KW',
        state: data.shipping.governorate,
        city: data.shipping.area,
        postalCode: '00000',
        landmark: data.shipping.landmark || '',
        addressLine1: JSON.stringify({
          block: data.shipping.block,
          street: data.shipping.street,
          building: data.shipping.building,
          floorFlat: data.shipping.floorFlat || ''
        }),
        type: 'shipping'
      };

      if (finalShippingId) {
        // Update the existing address with current form values to keep them in sync
        await updateAddr.mutateAsync({ id: finalShippingId, payload: shippingPayload });
      } else {
        const newAddr = await createAddr.mutateAsync(shippingPayload);
        finalShippingId = newAddr?.data?.id || newAddr?.id;
      }

      // 2. Process Billing Address
      let finalBillingId = undefined;
      if (!data.billingSameAsShipping && data.billing) {
        const billingPayload = {
          name: data.billing.name,
          phone: data.billing.phone,
          country: 'KW',
          state: data.billing.governorate,
          city: data.billing.area,
          postalCode: '00000',
          landmark: data.billing.landmark || '',
          addressLine1: JSON.stringify({
            block: data.billing.block,
            street: data.billing.street,
            building: data.billing.building,
            floorFlat: data.billing.floorFlat || ''
          }),
          type: 'billing'
        };
        const newBillingAddr = await createAddr.mutateAsync(billingPayload);
        finalBillingId = newBillingAddr?.data?.id || newBillingAddr?.id;
      }

      // 3. Submit Checkout
      const response = await submitCheckout({
        cartId: cartSummary!.id,
        shippingAddressId: finalShippingId!,
        ...(finalBillingId ? { billingAddressId: finalBillingId } : {})
      });
      router.push(`/checkout/success?order=${response?.data?.order?.orderNumber || response?.order?.orderNumber || '0000'}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Checkout failed. Please try again.';
      toast.error(errorMessage);
      router.push(`/checkout/failure?reason=${encodeURIComponent(errorMessage)}`);
    } finally {
      setLoading(false);
    }
  };

  const billingSame = methods.watch('billingSameAsShipping');
  const validAddresses = Array.isArray(addresses) ? addresses : addresses?.items || [];

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <button onClick={() => router.push('/cart')} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Return to Cart
        </button>
      </div>

      <div className="pt-2 pb-8">
        <CheckoutStepper steps={STEPS} currentStepIndex={1} />
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 pb-20">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handlePlaceOrder)} className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            
            {/* Left Column: Forms */}
            <div className="flex-1 lg:w-[70%]">
              
              {/* Saved Addresses Selection */}
              {validAddresses.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    Saved Addresses
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validAddresses.map((addr: any) => {
                      let parsedStr = '';
                      try {
                        const p = JSON.parse(addr.addressLine1);
                        parsedStr = [p.block, p.street, p.building].filter(Boolean).join(', ');
                      } catch {
                        parsedStr = addr.addressLine1;
                      }

                      const isSelected = selectedShippingAddressId === addr.id;

                      return (
                        <div 
                          key={addr.id} 
                          onClick={() => handleSelectAddress(addr)}
                          className={cn(
                            "cursor-pointer p-4 rounded-2xl border transition-all relative overflow-hidden group",
                            isSelected 
                              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                              : "border-border/50 bg-card hover:border-primary/40 hover:bg-muted/20"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                               <div className="absolute top-[-10px] right-[-10px] w-8 h-8 bg-primary rotate-45 flex items-center justify-center shadow-md">
                               </div>
                               <svg className="absolute top-1 right-1 w-3 h-3 text-primary-foreground z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                          <div className="font-medium text-sm text-foreground mb-1 pr-6">{addr.name}</div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{parsedStr}</p>
                          <p className="text-xs text-muted-foreground">{addr.city}, {addr.state}</p>
                        </div>
                      );
                    })}
                    <div 
                      onClick={handleAddNewAddress}
                      className={cn(
                        "cursor-pointer p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center transition-all",
                        selectedShippingAddressId === null
                           ? "border-primary bg-primary/5 text-primary"
                           : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-muted/10"
                      )}
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">Add New Address</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">
                  {selectedShippingAddressId ? "Edit Delivery Details" : "New Delivery Details"}
                </h2>
                <AddressForm prefix="shipping" />
              </div>

              <div className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-6">Billing Address</h2>
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 mb-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="billingSame" 
                      checked={billingSame} 
                      onCheckedChange={(c) => methods.setValue('billingSameAsShipping', c as boolean, { shouldValidate: true })}
                      className="mt-1"
                    />
                    <label htmlFor="billingSame" className="text-sm leading-relaxed cursor-pointer font-medium">
                      Same as delivery address
                      <p className="text-muted-foreground font-normal mt-0.5">Your billing address must match the address associated with your payment method.</p>
                    </label>
                  </div>
                </div>

                {!billingSame && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <AddressForm prefix="billing" />
                  </div>
                )}
              </div>

              {/* Mobile Place Order */}
              <div className="block lg:hidden mt-8">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all rounded-2xl h-12 font-medium uppercase tracking-[0.15em] flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:w-[30%] relative">
              <div className="sticky top-8 bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-muted/20 rounded-xl border border-border/30">
                      <div className="w-16 h-20 bg-muted rounded-md overflow-hidden shrink-0 relative border border-border/50">
                        <img src={item.image || 'https://via.placeholder.com/80'} alt={item.productName} className="w-full h-full object-cover" />
                        <div className="absolute -top-2 -right-2 bg-foreground text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-medium text-sm text-foreground line-clamp-1">{item.productName}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Size: {item.variant?.size || 'Standard'}</p>
                      </div>
                      <div className="font-medium text-sm flex items-center">
                        <Price amount={item.unitPrice} />
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-border/50 my-6" />

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{preview?.subtotal !== undefined ? <Price amount={preview.subtotal} /> : <Price amount={0} />}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{preview?.deliveryFee ? <Price amount={preview.deliveryFee} /> : 'Calculated at checkout'}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax</span>
                    <span>{preview?.taxTotal !== undefined ? <Price amount={preview.taxTotal} /> : <Price amount={0} />}</span>
                  </div>
                </div>

                <hr className="border-border/50 my-6" />

                <div className="flex justify-between items-end mb-6">
                  <span className="font-semibold text-lg text-foreground">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block mb-1 uppercase">{currencyCode}</span>
                    <span className="font-bold text-3xl text-foreground">{preview?.grandTotal !== undefined ? `${preview.grandTotal.toFixed(2)}` : '0.00'}</span>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-6">
                  <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 text-primary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <span>
                      <strong className="text-foreground block mb-1">Manual Payment Collection</strong>
                      Once placed, your order will remain pending. Our team will contact you to confirm delivery and arrange secure payment.
                    </span>
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="hidden lg:flex w-full bg-foreground text-background hover:bg-foreground/90 transition-all rounded-2xl h-12 font-medium uppercase tracking-[0.15em] items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>

          </form>
        </FormProvider>
      </main>
    </div>
  );
}
