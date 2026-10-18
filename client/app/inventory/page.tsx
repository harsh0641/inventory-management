"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useGetProductsQuery } from "../state/api";
import Header from "../(components)/Header/index";
import Rating from "../(components)/Rating";
import { 
  Search, 
  Download, 
  ArrowUpDown, 
  PackagePlus, 
  AlertTriangle,
  X,
  Check
} from "lucide-react";

const S3_ASSETS = "https://s3-inventorymanagement14.s3.us-east-1.amazonaws.com/assets";
const LOW_STOCK_THRESHOLD = 200_000;

const imageIndexFor = (id: string | number) => {
  let hash = 0;
  for (const char of String(id)) {
    hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 3) + 1;
};

type SortField = "name" | "price" | "rating" | "stockQuantity";

const Inventory = () => {
  const { data: products, isError, isLoading } = useGetProductsQuery();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lowStock">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [restockProduct, setRestockProduct] = useState<any | null>(null);
  const [restockAmount, setRestockAmount] = useState(5000);

  // Sorting + Filtering
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || p.stockQuantity < LOW_STOCK_THRESHOLD;
        return matchesSearch && matchesFilter;
      })
      .sort((a: any, b: any) => {
        let valA = a[sortField] ?? 0;
        let valB = b[sortField] ?? 0;
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [products, search, filter, sortField, sortAsc]);

  const lowStockCount = useMemo(
    () => products?.filter((p: any) => p.stockQuantity < LOW_STOCK_THRESHOLD).length ?? 0,
    [products]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) setSelectedIds([]);
    else setSelectedIds(filteredProducts.map((p: any) => p.productId));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const list = selectedIds.length 
      ? filteredProducts.filter((p: any) => selectedIds.includes(p.productId)) 
      : filteredProducts;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Price,Rating,Stock"]
        .concat(list.map((p: any) => `"${p.productId}","${p.name}",${p.price},${p.rating ?? 0},${p.stockQuantity}`))
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (isLoading) {
    return <div className="p-8 text-sm font-medium text-gray-400 animate-pulse">Loading inventory records...</div>;
  }

  if (isError || !products) {
    return <div className="p-8 text-sm text-rose-500">Failed to load inventory data. Please refresh.</div>;
  }

  return (
    <div className="flex flex-col gap-5 px-1 pb-16">
      <Header name="Inventory" />

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_12px_rgba(79,70,229,0.06)] border border-gray-100">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full bg-gray-50 pl-9 pr-4 text-xs font-medium text-gray-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-transparent"
            />
          </div>

          <div className="inline-flex rounded-full bg-gray-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1.5 transition-all ${
                filter === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setFilter("lowStock")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
                filter === "lowStock" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-xs font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95 shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-gray-500" />
          Export CSV
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(79,70,229,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 border-collapse">
            <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-semibold text-gray-900 uppercase tracking-wider">
              <tr>
                <th className="py-4 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                </th>
                <th 
                  onClick={() => toggleSort("name")}
                  className="py-4 px-4 cursor-pointer hover:text-indigo-600 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Product
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort("price")}
                  className="py-4 px-4 cursor-pointer hover:text-indigo-600 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Price
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort("rating")}
                  className="py-4 px-4 cursor-pointer hover:text-indigo-600 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Rating
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort("stockQuantity")}
                  className="py-4 px-4 cursor-pointer hover:text-indigo-600 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Stock Status
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th className="py-4 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((p: any) => {
                const isSelected = selectedIds.includes(p.productId);
                const isLow = p.stockQuantity < LOW_STOCK_THRESHOLD;

                return (
                  <tr 
                    key={p.productId} 
                    className={`group transition-colors ${
                      isSelected ? "bg-indigo-50/50" : "hover:bg-indigo-50/20"
                    }`}
                  >
                    <td className="py-3.5 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.productId)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`${S3_ASSETS}/product${imageIndexFor(p.productId)}.png`}
                          alt={p.name}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-2xl bg-gray-100 object-cover border border-gray-100 shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">
                            ID: {String(p.productId).slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-indigo-600 text-[13px]">
                        ${Number(p.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Rating rating={p.rating || 0} />
                        <span className="text-xs text-gray-400 font-medium">({p.rating ?? 0})</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isLow
                            ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${isLow ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        {p.stockQuantity.toLocaleString()} units
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setRestockProduct(p)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-full transition"
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Restock Product</h3>
              <button 
                onClick={() => setRestockProduct(null)} 
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="py-4">
              <p className="text-xs text-gray-500 mb-1">Add units to:</p>
              <p className="text-sm font-semibold text-gray-900 mb-4">{restockProduct.name}</p>

              <label className="text-xs font-medium text-gray-700 block mb-2">Quantity to add</label>
              <div className="flex gap-2">
                {[1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setRestockAmount(amt)}
                    className={`flex-1 rounded-xl py-2 text-xs font-medium border transition ${
                      restockAmount === amt 
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600" 
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRestockProduct(null)}
                className="flex-1 rounded-full border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  restockProduct.stockQuantity += restockAmount;
                  setRestockProduct(null);
                }}
                className="flex-1 rounded-full bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MULTI-SELECT ISLAND */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-gray-900 px-5 py-2.5 text-white shadow-2xl transition">
          <span className="text-xs font-medium text-gray-300">
            <span className="font-semibold text-white">{selectedIds.length}</span> selected
          </span>
          <div className="h-4 w-px bg-gray-700" />
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-200 transition hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Export Selected
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="rounded-full bg-gray-800 px-2 py-0.5 text-[11px] text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;