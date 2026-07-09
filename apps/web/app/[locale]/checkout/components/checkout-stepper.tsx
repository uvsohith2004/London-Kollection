import React from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStepIndex: number;
}

export function CheckoutStepper({ steps, currentStepIndex }: StepperProps) {
  return (
    <div className="w-full flex items-center justify-center pt-6 pb-12">
      <div className="flex items-center w-full max-w-2xl mx-auto px-4 relative">
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex > index;
          const isCurrent = currentStepIndex === index;
          const isPending = currentStepIndex < index;

          return (
            <React.Fragment key={step}>
              {/* Node */}
              <div className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-semibold transition-colors duration-300
                    ${isCompleted ? 'bg-[#2ECC71] text-white shadow-sm' : ''}
                    ${isCurrent ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20' : ''}
                    ${isPending ? 'bg-muted text-muted-foreground border border-border' : ''}
                  `}
                >
                  {isCompleted ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : index + 1}
                </div>
                <span 
                  className={`absolute top-12 md:top-14 text-[10px] md:text-xs font-medium uppercase tracking-wider whitespace-nowrap
                    ${(isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Line between nodes */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 md:mx-4 h-[2px] relative z-0">
                   <div className="absolute inset-0 bg-border/60"></div>
                   <div 
                     className="absolute inset-y-0 left-0 bg-[#2ECC71] transition-all duration-500 ease-out"
                     style={{ width: isCompleted ? '100%' : '0%' }}
                   ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
