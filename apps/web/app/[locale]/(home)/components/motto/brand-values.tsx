import { Truck, ShieldCheck, Undo2 } from "lucide-react"

export function HomeBrandValues() {
  const values = [
   
    {
      icon: <Undo2 className="w-6 h-6 stroke-[1.5]" />,
      title: "Free Returns",
      description: "Within 14 days of purchase"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 stroke-[1.5]" />,
      title: "Secure Checkout",
      description: "100% protected payments"
    }
  ]

  return (
    <div className="w-full border-t border-border/40 py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-border/40">
          
          {values.map((value, index) => (
            <div key={index} className="flex flex-col items-center text-center pt-8 md:pt-0 px-4 first:pt-0">
              <div className="mb-4 text-foreground/80">
                {value.icon}
              </div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-2" dir="auto">
                {value.title}
              </h4>
              <p className="text-muted-foreground text-sm font-light" dir="auto">
                {value.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  )
}
