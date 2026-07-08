import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Editorial404() {
  return (
    // 'fixed inset-0 z-50' completely covers the global navbar and footer
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      
      {/* Massive Background Typography - Hollow/Outline Effect */}
      <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none overflow-hidden whitespace-nowrap pl-4 md:pl-12">
        <h1 
          className="font-serif text-[40vh] font-bold leading-none tracking-tighter sm:text-[50vh] md:text-[65vh]"
          style={{
            WebkitTextStroke: "2px hsl(var(--border) / 0.4)",
            color: "transparent",
          }}
        >
          404
        </h1>
      </div>

      {/* Foreground Content - Asymmetrical Bottom-Right Placement */}
      <div className="relative z-10 flex h-full w-full flex-col justify-end p-8 md:flex-row md:items-end md:justify-between md:p-16 lg:p-24">
        
        {/* Left/Top Area: Brand Mark */}
        <div className="absolute left-8 top-8 md:left-16 md:top-16">
          <span className="font-serif text-xl tracking-widest uppercase">
            London Kollection
          </span>
        </div>

        {/* Right/Bottom Area: Messaging & Actions */}
        <div className="mb-12 max-w-md md:mb-0">
          <span className="mb-4 block text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Error — Page Not Found
          </span>
          
          <h2 className="mb-6 font-serif text-4xl leading-tight tracking-tight md:text-5xl">
            This thread has <br />
            <span className="italic text-muted-foreground">unraveled.</span>
          </h2>
          
          <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
            The page you are searching for has been archived, moved, or perhaps never existed within our current collection.
          </p>

          {/* Minimalist Action Links */}
          <div className="flex flex-col gap-6">
            <Link 
              href="/"
              className="group flex w-fit items-center text-sm font-medium uppercase tracking-widest transition-colors hover:text-muted-foreground"
            >
              <span className="mr-4 h-px w-8 bg-foreground transition-all duration-300 group-hover:w-12"></span>
              Return to Homepage
            </Link>

            <Link 
              href="/shop"
              className="group flex w-fit items-center text-sm font-medium uppercase tracking-widest transition-colors hover:text-muted-foreground"
            >
              <span className="mr-4 h-px w-8 bg-foreground transition-all duration-300 group-hover:w-12"></span>
              Explore New Arrivals
              <ArrowRight className="ml-2 h-4 w-4 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
