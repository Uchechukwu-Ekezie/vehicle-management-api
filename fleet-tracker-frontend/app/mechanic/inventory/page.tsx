"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { partsApi } from "@/lib/api";

interface Part {
  id: number;
  partName: string;
  partNumber: string;
  quantity: number;
  minStockLevel: number;
  unitCost: number;
}

export default function MechanicInventoryPage() {
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    partName: "",
    partNumber: "",
    quantity: 0,
    minStockLevel: 0,
    unitCost: 0,
  });

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      const allParts = await partsApi.getAll(token);
      setParts(allParts);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";

      if (editingPart) {
        await partsApi.update(editingPart.id, formData, token);
      } else {
        await partsApi.create(formData, token);
      }

      setFormData({
        partName: "",
        partNumber: "",
        quantity: 0,
        minStockLevel: 0,
        unitCost: 0,
      });
      setShowForm(false);
      setEditingPart(null);
      await loadParts();
    } catch {
      alert("Failed to save part");
    }
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setFormData({
      partName: part.partName,
      partNumber: part.partNumber,
      quantity: part.quantity,
      minStockLevel: part.minStockLevel,
      unitCost: part.unitCost,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this part?")) return;

    try {
      const token =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || "";
      await partsApi.delete(id, token);
      await loadParts();
    } catch {
      alert("Failed to delete part");
    }
  };

  const getLowStockParts = () => {
    return parts.filter((part: Part) => part.quantity <= part.minStockLevel);
  };

  const getStockStatusColor = (part: Part) => {
    if (part.quantity === 0) return "bg-red-100 text-red-800 border-red-200";
    if (part.quantity <= part.minStockLevel)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStockStatus = (part: Part) => {
    if (part.quantity === 0) return "Out of Stock";
    if (part.quantity <= part.minStockLevel) return "Low Stock";
    return "In Stock";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parts Inventory</h1>
          <p className="text-gray-600 mt-1">
            Manage spare parts and stock levels
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setEditingPart(null);
              setFormData({
                partName: "",
                partNumber: "",
                quantity: 0,
                minStockLevel: 0,
                unitCost: 0,
              });
              setShowForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Part
          </Button>
        )}
      </div>

      {/* Low Stock Alert */}
      {getLowStockParts().length > 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {getLowStockParts().length} part
                  {getLowStockParts().length !== 1 ? "s" : ""} running low or
                  out of stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              {editingPart ? "Edit Part" : "Add New Part"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="partName"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Part Name *
                  </label>
                  <Input
                    id="partName"
                    value={formData.partName}
                    onChange={(e) =>
                      setFormData({ ...formData, partName: e.target.value })
                    }
                    placeholder="e.g., Oil Filter"
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="partNumber"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Part Number *
                  </label>
                  <Input
                    id="partNumber"
                    value={formData.partNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, partNumber: e.target.value })
                    }
                    placeholder="e.g., OF-12345"
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Current Quantity *
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="minStockLevel"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Minimum Stock Level *
                  </label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStockLevel: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label
                    htmlFor="unitCost"
                    className="text-sm font-semibold text-gray-700 mb-2 block"
                  >
                    Unit Cost ($) *
                  </label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unitCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPart(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingPart ? "Update Part" : "Add Part"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Parts Grid */}
      {parts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts.map((part) => (
            <Card
              key={part.id}
              className="border-2 hover:border-purple-200 hover:shadow-lg transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      {part.partName}
                    </h3>
                    <p className="text-base text-gray-700">#{part.partNumber}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStockStatusColor(
                      part
                    )}`}
                  >
                    {getStockStatus(part)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Quantity</span>
                    <span className="font-bold text-gray-900">
                      {part.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <span className="text-sm text-yellow-700">Min Stock</span>
                    <span className="font-bold text-yellow-900">
                      {part.minStockLevel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm text-green-700">Unit Cost</span>
                    <span className="font-bold text-green-900">
                      ${part.unitCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <span className="text-sm text-purple-700">Total Value</span>
                    <span className="font-bold text-purple-900">
                      ${(part.quantity * part.unitCost).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(part)}
                    className="flex-1"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(part.id)}
                    className="text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <svg
              className="w-20 h-20 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-gray-600 text-lg">No parts in inventory</p>
            <p className="text-gray-700 text-base mt-2">
              Click &quot;Add New Part&quot; to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
