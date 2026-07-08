"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"

export function HomeNewsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast.success("Thank you for subscribing! Welcome to the club.")
    setEmail("")
  }

  return (
    <section className="w-full bg-foreground text-background py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-serif mb-4 tracking-wide" dir="auto">The Insider</h2>
        <p className="text-background/80 font-light mb-8 text-sm md:text-base max-w-lg mx-auto" dir="auto">
          Join our mailing list to receive early access to new collections, exclusive events, and bespoke editorial content.
        </p>
        
        <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto" onSubmit={handleSubmit} dir="ltr">
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 flex-1 bg-background text-foreground px-4 text-sm focus:outline-none focus:ring-2 focus:ring-background/50 placeholder:text-muted-foreground"
            required
          />
          <Button 
            type="submit" 
            variant="outline"
            className="h-12 bg-background/10 text-background border-background/20 hover:bg-background hover:text-foreground uppercase tracking-widest text-xs font-semibold px-8 rounded-none transition-colors"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  )
}
