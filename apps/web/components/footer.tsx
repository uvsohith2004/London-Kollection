import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/40 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-serif tracking-tight text-foreground uppercase" dir="auto">
              London<br />Kollection
            </h2>
            <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-xs" dir="auto">
              Redefining premium modesty and elegance through meticulous craftsmanship and timeless design.
            </p>
          </div>

          {/* Column 2: Shop */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground" dir="auto">Shop</h3>
            <Link href="/new-arrivals" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">New Arrivals</Link>
            <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Collections</Link>
            <Link href="/clothing" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Clothing</Link>
            <Link href="/accessories" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Accessories</Link>
          </div>

          {/* Column 3: Customer Care */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground" dir="auto">Customer Care</h3>
            <Link href="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Shipping & Returns</Link>
            <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">FAQ</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Contact Us</Link>
            <Link href="/track-order" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Track Order</Link>
          </div>

          {/* Column 4: Legal & Social */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground" dir="auto">Legal</h3>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Terms & Conditions</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit" dir="auto">Privacy Policy</Link>
            
            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mt-4" dir="auto">Connect</h3>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" dir="auto">Instagram</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" dir="auto">TikTok</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors" dir="auto">Pinterest</a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-light" dir="auto">
            &copy; {new Date().getFullYear()} London Kollection. All rights reserved.
          </p>
          <div className="flex gap-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">KWD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
