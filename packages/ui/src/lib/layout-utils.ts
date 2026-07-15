export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "wide"

export type Responsive<T> = T | {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  wide?: T
}

type Size = "none" | "xs" | "sm" | "md" | "lg" | "xl"

const breakpointPrefix = (bp: Breakpoint) => {
  switch (bp) {
    case "xs": return ""
    case "sm": return "sm:"
    case "md": return "md:"
    case "lg": return "lg:"
    case "xl": return "xl:"
    case "wide": return "2xl:"
  }
}

function resolveResponsive<T>(
  value: Responsive<T> | undefined,
  resolver: (val: T, prefix: string) => string
): string {
  if (value === undefined) return ""
  
  if (typeof value !== "object" || value === null) {
    return resolver(value as T, "")
  }

  const responsiveObj = value as Record<Breakpoint, T | undefined>
  const classes: string[] = []

  for (const [bp, val] of Object.entries(responsiveObj)) {
    if (val !== undefined) {
      classes.push(resolver(val, breakpointPrefix(bp as Breakpoint)))
    }
  }

  return classes.join(" ")
}

// Map sizes to standard Tailwind spacing
const sizeMap: Record<Size, string> = {
  none: "0",
  xs: "2",
  sm: "4",
  md: "6",
  lg: "8",
  xl: "12",
}

export function createGapClass(gap?: Responsive<Size>): string {
  return resolveResponsive(gap, (val, prefix) => `${prefix}gap-${sizeMap[val]}`)
}

export function createPaddingClass(padding?: Responsive<Size>): string {
  return resolveResponsive(padding, (val, prefix) => `${prefix}p-${sizeMap[val]}`)
}

export function createMarginClass(margin?: Responsive<Size>): string {
  return resolveResponsive(margin, (val, prefix) => `${prefix}m-${sizeMap[val]}`)
}

export function createGridColumnsClass(columns?: Responsive<number>): string {
  return resolveResponsive(columns, (val, prefix) => `${prefix}grid-cols-${val}`)
}

export function createGridSpanClass(span?: Responsive<number>): string {
  return resolveResponsive(span, (val, prefix) => `${prefix}col-span-${val}`)
}

export function createGridStartClass(start?: Responsive<number>): string {
  return resolveResponsive(start, (val, prefix) => `${prefix}col-start-${val}`)
}

export function createGridEndClass(end?: Responsive<number>): string {
  return resolveResponsive(end, (val, prefix) => `${prefix}col-end-${val}`)
}

export function createGridRowSpanClass(span?: Responsive<number>): string {
  return resolveResponsive(span, (val, prefix) => `${prefix}row-span-${val}`)
}

export function createGridRowStartClass(start?: Responsive<number>): string {
  return resolveResponsive(start, (val, prefix) => `${prefix}row-start-${val}`)
}

export function createGridRowEndClass(end?: Responsive<number>): string {
  return resolveResponsive(end, (val, prefix) => `${prefix}row-end-${val}`)
}

export function createOrderClass(order?: Responsive<number>): string {
  return resolveResponsive(order, (val, prefix) => `${prefix}order-${val}`)
}

export function createDisplayClass(display?: Responsive<"none" | "block" | "flex" | "grid">): string {
  return resolveResponsive(display, (val, prefix) => {
    if (val === "none") return `${prefix}hidden`
    return `${prefix}${val}`
  })
}
