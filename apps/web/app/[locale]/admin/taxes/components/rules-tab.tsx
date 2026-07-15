"use client"

import * as React from "react"
import { Plus, Loader2, Edit2, Trash2 } from "lucide-react"
import {
  useTaxRulesQuery,
  useTaxClassesQuery,
  useTaxRatesQuery,
} from "../../queries"
import { useDeleteTaxRuleMutation } from "../../mutations"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { TaxRuleForm } from "./tax-rule-editor-dialog"
import {
  DataView,
  DataViewToolbar,
  DataViewContent,
  DataViewListCard,
  DataViewGridCard,
} from "@/components/data-view"

export function RulesTab() {
  const { data: response, isLoading } = useTaxRulesQuery()
  const { data: classesResponse } = useTaxClassesQuery()
  const { data: ratesResponse } = useTaxRatesQuery()

  const { mutate: deleteTaxRule } = useDeleteTaxRuleMutation()

  const [isCreating, setIsCreating] = React.useState(false)
  const [editingRule, setEditingRule] = React.useState<any>(null)

  const items = response?.items || []
  const taxClasses = classesResponse?.items || []
  const taxRates = ratesResponse?.items || []

  const handleEdit = (taxRule: any) => {
    setEditingRule(taxRule)
    setIsCreating(false)
  }

  const handleCreate = () => {
    setEditingRule(null)
    setIsCreating(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tax rule?")) {
      deleteTaxRule(id)
    }
  }

  const getClassName = (id: string) => {
    const cls = taxClasses.find((c: any) => c.id === id)
    return cls ? cls.name : "Unknown Class"
  }

  const getRateDetails = (id: string) => {
    const rate = taxRates.find((r: any) => r.id === id)
    return rate
      ? { name: rate.name, percentage: Number(rate.percentage) }
      : { name: "Unknown Rate", percentage: 0 }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-medium tracking-tight">Tax Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure condition-based tax logic.
          </p>
        </div>
        {!isCreating && !editingRule && (
          <Button
            onClick={handleCreate}
            className="rounded-full px-6 tracking-widest uppercase"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tax Rule
          </Button>
        )}
      </div>

      {/* Expandable Form Area */}
      {(isCreating || editingRule) && (
        <div className="mb-8 animate-in duration-300 fade-in slide-in-from-top-4">
          <TaxRuleForm
            initialData={editingRule}
            onSuccess={() => {
              setIsCreating(false)
              setEditingRule(null)
            }}
            onCancel={() => {
              setIsCreating(false)
              setEditingRule(null)
            }}
          />
        </div>
      )}

      <DataView
        data={items}
        filterFn={(item: any, query: string) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        availableLayouts={["list-card", "table", "block-card"]}
        defaultLayout="table"
        enableDetailsModal={false}
      >
        <div className="mb-6">
          <DataViewToolbar searchPlaceholder="Search tax rules..." />
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
              header: "Class",
              cell: (item: any) => (
                <span className="text-muted-foreground">
                  {getClassName(item.taxClassId)}
                </span>
              ),
            },
            {
              header: "Maps to Rate",
              cell: (item: any) => (
                <span className="text-muted-foreground">
                  {getRateDetails(item.taxRateId).name}
                </span>
              ),
            },
            {
              header: "Percentage",
              cell: (item: any) => (
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/10 text-primary"
                >
                  {getRateDetails(item.taxRateId).percentage}%
                </Badge>
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
              subtitle={`Tax Class: ${getClassName(item.taxClassId)}`}
              metadata={
                <span className="font-mono">
                  {getRateDetails(item.taxRateId).name} (
                  {getRateDetails(item.taxRateId).percentage}%)
                </span>
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          renderBlockCard={(item: any) => (
            <DataViewGridCard
              item={item}
              title={item.name}
              subtitle={`Tax Class: ${getClassName(item.taxClassId)}`}
              metadata={
                <span className="font-mono">
                  {getRateDetails(item.taxRateId).name} (
                  {getRateDetails(item.taxRateId).percentage}%)
                </span>
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
              <h4 className="text-lg font-medium">No Tax Rules Found</h4>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create tax rules to link product classes to geographical rates.
              </p>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="mt-6 rounded-full px-6"
              >
                Create Tax Rule
              </Button>
            </div>
          }
        />
      </DataView>
    </div>
  )
}
