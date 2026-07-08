import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-index-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add listener to track screen resizing changes
    mql.addEventListener("change", onChange)
    
    // Set initial state value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Clean up listener when component unmounts
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
