import Link from "next/link"

export function HomeShopByPrice() {
  const priceBrackets = [
    { label: "Under 100 KWD", link: "/search?price=under-100" },
    { label: "100 - 300 KWD", link: "/search?price=100-300" },
    { label: "300 - 500 KWD", link: "/search?price=300-500" },
    { label: "Over 500 KWD", link: "/search?price=over-500" }
  ]

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-6 mb-8 text-center md:text-start flex flex-col md:flex-row md:items-end justify-between gap-4">
        <h2 className="text-3xl md:text-4xl font-serif tracking-tight" dir="auto">Shop by Price</h2>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {priceBrackets.map((bracket, idx) => (
            <Link 
              key={idx} 
              href={bracket.link}
              className="group bg-secondary/20 hover:bg-foreground transition-colors duration-300 py-10 md:py-16 flex items-center justify-center border border-border/50"
            >
              <span className="text-foreground group-hover:text-background text-sm md:text-base uppercase tracking-widest font-semibold transition-colors duration-300" dir="auto">
                {bracket.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
