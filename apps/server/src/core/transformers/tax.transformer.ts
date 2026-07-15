import type { TaxClass, TaxRate, TaxRule } from "@workspace/api-contracts"

export function transformTaxClass(raw: any): TaxClass {
  return raw as TaxClass
}

export function transformTaxClassList(raw: any): TaxClass {
  return transformTaxClass(raw)
}

export function transformTaxRate(raw: any): TaxRate {
  return raw as TaxRate
}

export function transformTaxRateList(raw: any): TaxRate {
  return transformTaxRate(raw)
}

export function transformTaxRule(raw: any): TaxRule {
  return raw as TaxRule
}

export function transformTaxRuleList(raw: any): TaxRule {
  return transformTaxRule(raw)
}
