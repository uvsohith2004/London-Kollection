'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { 
  Check, 
  Truck, 
  Package, 
  Box, 
  RotateCcw, 
  RefreshCcw, 
  MapPin, 
  XCircle, 
  Clock, 
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { OrderStatus } from '../types/types';

interface OrderProgressBarProps {
  status: OrderStatus;
}

export function OrderProgressBar({ status }: OrderProgressBarProps) {
  const t = useTranslations('Orders');

  type Step = { id: string | string[]; icon: React.ElementType; label: string };

  // Define steps for different flows
  const standardSteps: Step[] = [
    { id: 'pending', icon: Clock, label: t('statusPending') || 'Pending' },
    { id: 'processing', icon: Box, label: t('statusProcessing') || 'Processing' },
    { id: 'packed', icon: Package, label: t('statusPacked') || 'Packed' },
    { id: 'shipped', icon: Truck, label: t('statusShipped') || 'Shipped' },
    { id: 'out_for_delivery', icon: MapPin, label: t('statusOut_for_delivery') || 'Out for Delivery' },
    { id: 'delivered', icon: CheckCircle2, label: t('statusDelivered') || 'Delivered' },
  ];

  const returnSteps: Step[] = [
    { id: 'delivered', icon: CheckCircle2, label: t('statusDelivered') || 'Delivered' },
    { id: 'return_requested', icon: RotateCcw, label: t('statusReturn_requested') || 'Return Requested' },
    { 
      id: ['return_approved', 'return_rejected', 'returned'], 
      icon: status === 'return_rejected' ? XCircle : Check, 
      label: status === 'return_rejected' ? (t('statusReturn_rejected') || 'Return Rejected') : (status === 'returned' ? (t('statusReturned') || 'Returned') : (t('statusReturn_approved') || 'Return Approved')) 
    },
  ];

  const exchangeSteps: Step[] = [
    { id: 'delivered', icon: CheckCircle2, label: t('statusDelivered') || 'Delivered' },
    { id: 'exchange_requested', icon: RefreshCcw, label: t('statusExchange_requested') || 'Exchange Requested' },
    { 
      id: ['exchange_approved', 'exchange_rejected'], 
      icon: status === 'exchange_rejected' ? XCircle : Check, 
      label: status === 'exchange_rejected' ? (t('statusExchange_rejected') || 'Exchange Rejected') : (t('statusExchange_approved') || 'Exchange Approved') 
    },
  ];

  const pickupSteps: Step[] = [
    { id: 'pending', icon: Clock, label: t('statusPending') || 'Pending' },
    { id: 'processing', icon: Box, label: t('statusProcessing') || 'Processing' },
    { id: 'ready_for_pickup', icon: MapPin, label: t('statusReady_for_pickup') || 'Ready for Pickup' },
    { 
      id: ['pickup_successful', 'pickup_failed'], 
      icon: status === 'pickup_failed' ? XCircle : CheckCircle2, 
      label: status === 'pickup_failed' ? (t('statusPickup_failed') || 'Pickup Failed') : (t('statusPickup_successful') || 'Pickup Successful') 
    },
  ];

  // Determine which flow to display based on current status
  let currentSteps: Step[] = standardSteps;
  if (['return_requested', 'return_approved', 'return_rejected', 'returned'].includes(status)) {
    currentSteps = returnSteps;
  } else if (['exchange_requested', 'exchange_approved', 'exchange_rejected'].includes(status)) {
    currentSteps = exchangeSteps;
  } else if (['ready_for_pickup', 'pickup_successful', 'pickup_failed'].includes(status)) {
    currentSteps = pickupSteps;
  }

  // Handle singular exception states that override the whole bar if they occur early
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
        <XCircle className="w-5 h-5" />
        <span className="font-medium">{t('statusCancelled') || 'Order Cancelled'}</span>
      </div>
    );
  }

  if (status === 'rescheduled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20">
        <CalendarDays className="w-5 h-5" />
        <span className="font-medium">{t('statusRescheduled') || 'Delivery Rescheduled'}</span>
      </div>
    );
  }

  // Find current step index
  const currentIndex = currentSteps.findIndex(step => {
    if (Array.isArray(step.id)) {
      return step.id.includes(status);
    }
    return step.id === status;
  });

  // If status is not found in the flow (fallback), just show index 0 or max
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full" />
        
        {/* Active Track */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-foreground transition-all duration-500 rounded-full"
          style={{ width: `${(activeIndex / (currentSteps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {currentSteps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const isError = Array.isArray(step.id) && (step.id.includes('return_rejected') || step.id.includes('exchange_rejected') || step.id.includes('pickup_failed')) && isCurrent;

          const Icon = step.icon;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isError 
                    ? 'bg-red-500 border-red-500 text-white'
                    : isActive 
                      ? 'bg-foreground border-foreground text-background' 
                      : 'bg-card border-border text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium text-center max-w-[80px] leading-tight ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
