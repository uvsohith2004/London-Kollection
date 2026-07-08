"use client"
import { useState, useEffect } from "react"
import { useAdminReturnsQuery } from "../queries"
import { useUpdateReturnStatusMutation as useAdminUpdateReturnStatusMutation } from "../mutations"

export default function AdminReturnsPage() {
  const { data: returns = [], isLoading } = useAdminReturnsQuery()
  const updateStatusMutation = useAdminUpdateReturnStatusMutation()

  const handleStatusUpdate = async (id: string, status: string) => {
    let notes = ""
    if (status === "Rejected") {
      notes = prompt("Enter reason for rejection:") || ""
      if (!notes) return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: {
          status,
          resolutionDetails: notes,
        },
      })
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  if (isLoading)
    return <div className="p-8 text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Return Requests</h1>
      <div className="grid gap-6">
        {returns.map((req: any) => (
          <div
            key={req.id}
            className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row"
          >
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    Order #{req.order?.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    req.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : req.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {req.status}
                </span>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p>
                  <strong className="font-medium">Type:</strong>{" "}
                  {req.returnType}
                </p>
                <p>
                  <strong className="font-medium">Reason:</strong>{" "}
                  {req.reason || "None provided"}
                </p>
              </div>
              {req.images && req.images.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Evidence Photos:</p>
                  <div className="flex gap-2">
                    {req.images.map((img: string, i: number) => (
                      <img
                        key={i}
                        src={img}
                        alt="evidence"
                        className="h-16 w-16 rounded-lg border object-cover"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col justify-center gap-3 md:w-48">
              {req.status === "Pending" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(req.id, "Approved")}
                    className="w-full rounded-lg bg-black py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Approve Return
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(req.id, "Rejected")}
                    className="w-full rounded-lg border border-red-200 bg-white py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Reject Request
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {returns.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No return requests found.
          </div>
        )}
      </div>
    </div>
  )
}
