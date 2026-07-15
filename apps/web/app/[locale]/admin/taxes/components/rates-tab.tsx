"use client"

import * as React from "react"
import { Plus, Loader2, Edit2, Trash2 } from "lucide-react"
import { useTaxRatesQuery } from "../../queries"
import { useDeleteTaxRateMutation } from "../../mutations"
import { Button } from "@workspace/ui/components/button"
import { TaxRateForm } from "./tax-rate-editor-dialog"
import {
  DataView,
  DataViewToolbar,
  DataViewContent,
  DataViewListCard,
  DataViewGridCard,
} from "@/components/data-view"
import { Badge } from "@workspace/ui/components/badge"

export function RatesTab() {
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingRate, setEditingRate] = React.useState<any>(null)

  const { data: response, isLoading } = useTaxRatesQuery()
  const { mutate: deleteTaxRate } = useDeleteTaxRateMutation()

  const items = response?.items || []

  const handleEdit = (taxRate: any) => {
    setEditingRate(taxRate)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingRate(null)
    setIsCreating(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tax rate?")) {
      deleteTaxRate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">Tax Rates</h3>
          <p className="text-sm text-muted-foreground">
            Configure tax percentages for different regions and classes.
          </p>
        </div>
        {!isCreating && !editingRate && (
          <Button
            onClick={handleCreate}
            className="rounded-full px-6 tracking-widest uppercase"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tax Rate
          </Button>
        )}
      </div>

      {/* Expandable Form Area */}
      {(isCreating || editingRate) && (
        <div className="mb-8 animate-in duration-300 fade-in slide-in-from-top-4">
          <TaxRateForm
            initialData={editingRate}
            onSuccess={() => {
              setIsCreating(false)
              setEditingRate(null)
            }}
            onCancel={() => {
              setIsCreating(false)
              setEditingRate(null)
            }}
          />
        </div>
      )}

      <DataView
        data={items}
        filterFn={(item: any, query: string) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.countryCode.toLowerCase().includes(query.toLowerCase())
        }
        availableLayouts={["list-card", "table", "block-card"]}
        defaultLayout="table"
        enableDetailsModal={false}
      >
        <div className="mb-6">
          <DataViewToolbar searchPlaceholder="Search tax rates..." />
        </div>
        <DataViewContent
          columns={[
            {
              header: "Name",
              cell: (item: any) => (
                <span className="font-medium">{item.name}</span>
              ),
            },
            {
              header: "Country",
              cell: (item: any) => (
                <Badge
                  variant="secondary"
                  className="font-mono tracking-widest uppercase"
                >
                  {item.countryCode}
                </Badge>
              ),
            },
            {
              header: "Region",
              cell: (item: any) => (
                <span className="text-muted-foreground">
                  {item.region || "All Regions"}
                </span>
              ),
            },
            {
              header: "Percentage",
              cell: (item: any) => (
                <span className="font-semibold text-foreground">
                  {Number(item.percentage)}%
                </span>
              ),
            },
            {
              header: "",
              className: "text-right",
              cell: (item: any) => (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(item)
                    }}
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id)
                    }}
                    className="h-8 w-8 rounded-full text-destructive backdrop-blur hover:bg-destructive/10 hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          renderListCard={(item: any) => (
            <DataViewListCard
              item={item}
              title={item.name}
              subtitle={item.countryCode}
              metadata={
                <span className="font-mono">{Number(item.percentage)}%</span>
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          renderBlockCard={(item: any) => (
            <DataViewGridCard
              item={item}
              title={item.name}
              subtitle={item.countryCode}
              metadata={
                <span className="font-mono">{Number(item.percentage)}%</span>
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          emptyState={
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-card p-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-medium">No Tax Rates Found</h4>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create geographical tax percentages.
              </p>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="mt-6 rounded-full px-6"
              >
                Create Tax Rate
              </Button>
            </div>
          }
        />
      </DataView>
    </div>
  )
}
