"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useCreatProductMutation, useGetProductsQuery } from "../state/api";
import Header from "../(components)/Header";
import CreateProductModal from "./CreateProductModal";
import { Plus, Search, Check, Sparkles } from "lucide-react";
import { MotionConfig, motion } from "motion/react";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const S3_ASSETS =
  "https://s3-inventorymanagement14.s3.us-east-1.amazonaws.com/assets";

const LOW_STOCK_THRESHOLD = 200000;

// Deterministic image hashing
const imageIndexFor = (id: string | number) => {
  let hash = 0;
  for (const char of String(id)) {
    hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 3) + 1;
};

// ----------------------------------------------------------------------
// 3D FLIP CARD COMPONENT
// ----------------------------------------------------------------------
const ProductFlipCard = ({
  product,
  onUpdateStock,
}: {
  product: any;
  onUpdateStock: (id: string, amount: number) => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [restocked, setRestocked] = useState(false);
  const [managed, setManaged] = useState(false);

  const isLowStock = product.stockQuantity < LOW_STOCK_THRESHOLD;
  const isBestSeller = product.rating >= 4.0;
  const imgNum = imageIndexFor(product.productId);

  const handleRestock = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStock(product.productId, 5000);
    setRestocked(true);
    setTimeout(() => setRestocked(false), 1500);
  };

  const handleManage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStock(product.productId, 1000);
    setManaged(true);
    setTimeout(() => setManaged(false), 1500);
  };

  return (
    <div
      className="relative w-full h-[460px] sm:h-[450px] cursor-pointer group"
      style={{ perspective: "1200px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.9 }}
      >
        {/* =========================================
            FRONT FACE (Adaptive Light & Dark Surfaces)
        ========================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-[32px] bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Top Image Showcase - Object Contain with Proper Aspect Ratio */}
          <div className="relative h-[220px] w-full shrink-0 bg-[#F4F4F6] dark:bg-[#1B1B1B] flex items-center justify-center p-4">
            <div className="absolute top-4 left-4 z-10">
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md border ${
                  isLowStock
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-[#141414]/70 dark:bg-[#141414]/90 text-[#CDDC3C] border-[#CDDC3C]/40"
                }`}
              >
                {isLowStock ? "Low Stock" : "In Stock"}
              </span>
            </div>

            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={`${S3_ASSETS}/product${imgNum}.png`}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-contain p-2 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                priority={false}
              />
            </div>
          </div>

          {/* Card Content Area */}
          <div className="flex flex-col flex-1 px-5 pt-4 pb-5 justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-[#FFFFFF] tracking-tight truncate">
                  {product.name}
                </h3>
                <span className="rounded-full bg-[#CDDC3C] px-3 py-1 text-[13px] font-black text-[#141414] shadow-sm shrink-0">
                  ${Number(product.price).toFixed(0)}
                </span>
              </div>

              <p className="mt-2 text-xs sm:text-[13px] font-medium leading-relaxed text-gray-500 dark:text-zinc-400 line-clamp-2">
                Premium warehouse asset engineered for top-tier velocity. Verified authentic for direct distribution.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isBestSeller && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1 text-[11px] font-bold text-gray-700 dark:text-zinc-300">
                    <Sparkles className="h-3 w-3 text-[#141414] dark:text-[#CDDC3C]" />
                    Best Seller
                  </span>
                )}
                <span className="rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1 text-[11px] font-bold text-gray-700 dark:text-zinc-300">
                  {Math.round(product.stockQuantity / 1000)}k left
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManage}
              className="w-full mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#CDDC3C] py-3.5 text-sm font-black text-[#141414] shadow-md transition-all active:scale-95 hover:brightness-105"
            >
              {managed ? (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  Stock Added (+1k)
                </>
              ) : (
                "Manage Asset"
              )}
            </button>
          </div>
        </div>

        {/* =========================================
            BACK FACE (Adaptive Surfaces in Light & Dark Mode)
        ========================================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex flex-col border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#141414]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Subtle Ambient Background Texture */}
          <div className="absolute inset-0 opacity-10 dark:opacity-20 scale-125 mix-blend-overlay flex items-center justify-center pointer-events-none">
            <Image
              src={`${S3_ASSETS}/product${imgNum}.png`}
              alt="texture"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative z-10 flex flex-col h-full w-full p-5 justify-between">
            <div className="flex justify-end">
              <span className="rounded-full bg-gray-100 dark:bg-black/60 px-3 py-1 text-[11px] font-bold tracking-wide text-gray-700 dark:text-[#CDDC3C] border border-gray-200 dark:border-[#CDDC3C]/30 shadow-sm">
                SKU-{String(product.productId).slice(0, 4).toUpperCase()}
              </span>
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-[#FFFFFF] tracking-tight truncate">
                  {product.name}
                </h3>
                <span className="rounded-full bg-[#CDDC3C] px-3.5 py-1 text-[14px] font-black text-[#141414] shadow-sm shrink-0">
                  ${Number(product.price).toFixed(0)}
                </span>
              </div>

              <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-gray-600 dark:text-zinc-300 mb-4 line-clamp-2">
                Detailed inventory metrics and warehouse routing protocols. Ready for immediate global dispatch.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                {isBestSeller && (
                  <span className="rounded-full bg-gray-100 dark:bg-black/50 px-3 py-1 text-[11px] font-bold text-gray-700 dark:text-white border border-gray-200 dark:border-white/10">
                    Rating: {product.rating}
                  </span>
                )}
                <span className="rounded-full bg-gray-100 dark:bg-black/50 px-3 py-1 text-[11px] font-bold text-gray-700 dark:text-[#FFFFFF] border border-gray-200 dark:border-white/10">
                  {product.stockQuantity.toLocaleString()} total units
                </span>
              </div>

              <button
                type="button"
                onClick={handleRestock}
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#CDDC3C] py-3.5 text-sm font-black text-[#141414] shadow-md transition-all active:scale-95 hover:brightness-105"
              >
                {restocked ? (
                  <>
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    Restocked (+5k)
                  </>
                ) : (
                  "Restock Inventory"
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ----------------------------------------------------------------------
// MAIN PRODUCTS PAGE
// ----------------------------------------------------------------------
const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productList, setProductList] = useState<any[]>([]);

  const { data: serverProducts, isLoading, isError } = useGetProductsQuery(searchTerm);
  const [createProduct] = useCreatProductMutation();

  useEffect(() => {
    if (serverProducts) {
      setProductList(serverProducts);
    }
  }, [serverProducts]);

  const handleUpdateStock = (productId: string, amount: number) => {
    setProductList((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, stockQuantity: (item.stockQuantity || 0) + amount }
          : item
      )
    );
  };

  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-6 sm:gap-8 pb-20 w-full min-h-screen">
        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-1">
          <div>
            <Header name="Inventory Engine" />
            <p className="text-xs sm:text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1 tracking-tight">
              Tap any card to flip and reveal advanced warehouse analytics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400 dark:text-zinc-500 transition-colors group-focus-within:text-[#141414] dark:group-focus-within:text-[#CDDC3C]" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-full bg-white dark:bg-[#141414] pl-10 pr-4 text-xs sm:text-[13px] font-medium text-gray-900 dark:text-[#FFFFFF] border border-gray-200 dark:border-[#242424] shadow-sm outline-none transition-all focus:border-[#CDDC3C] focus:ring-2 focus:ring-[#CDDC3C]/20 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-[#CDDC3C] px-4 sm:px-5 text-xs sm:text-[13px] font-bold text-[#141414] shadow-md transition-colors hover:brightness-105"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span>New</span>
            </motion.button>
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[460px] sm:h-[450px] rounded-[32px] bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-sm animate-pulse flex flex-col overflow-hidden"
              >
                <div className="h-[220px] w-full bg-gray-100 dark:bg-[#1C1C1C]" />
                <div className="flex flex-col flex-1 px-5 pt-4 pb-5 space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 w-1/2 rounded-full bg-gray-100 dark:bg-[#1C1C1C]" />
                    <div className="h-6 w-16 rounded-full bg-gray-100 dark:bg-[#1C1C1C]" />
                  </div>
                  <div className="h-4 w-full rounded-full bg-gray-50 dark:bg-[#1C1C1C]/60" />
                  <div className="h-4 w-4/5 rounded-full bg-gray-50 dark:bg-[#1C1C1C]/60" />
                </div>
              </div>
            ))}
          </div>
        ) : isError || !productList ? (
          <div className="flex flex-col items-center justify-center rounded-[32px] bg-white dark:bg-[#141414] p-12 sm:p-16 border border-gray-100 dark:border-[#242424] text-center shadow-sm mx-1">
            <p className="text-sm font-bold text-rose-500">System Error</p>
            <p className="text-xs sm:text-[13px] text-gray-500 dark:text-zinc-400 mt-1">
              Unable to load the product catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-1">
            {productList.map((product) => (
              <ProductFlipCard
                key={product.productId}
                product={product}
                onUpdateStock={handleUpdateStock}
              />
            ))}
          </div>
        )}

        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateProduct}
        />
      </div>
    </MotionConfig>
  );
};

export default Products;