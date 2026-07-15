import type { Invoice } from "@workspace/api-contracts"

export function transformInvoice(raw: any): Invoice {
  return raw as Invoice
}

export function transformInvoiceList(raw: any): Invoice {
  return transformInvoice(raw)
}
