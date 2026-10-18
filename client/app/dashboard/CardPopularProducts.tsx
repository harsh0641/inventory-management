"use client";

import { useGetDashboardMetricsQuery } from "../state/api";
import { ArrowUpRight, EllipsisVertical, ShoppingBag } from "lucide-react";
import { MotionConfig, Variants, motion } from "motion/react";
import React from "react";
import Rating from "../(components)/Rating";
import Image from "next/image";

const S3_ASSETS =
  "https://s3-inventorymanagement14.s3.us-east-1.amazonaws.com/assets";

// Deterministic image index calculation
const imageIndexFor = (id: string | number) => {
  let hash = 0;
  for (const char of String(id)) {
    hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 3) + 1;
};

// ZAPR action button: Light Gray / Obsidian resting state, Electric Lime on hover
const roundButton =
  "flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#CDDC3C] hover:text-[#141414] dark:bg-[#1E1E1E] dark:text-zinc-300 dark:hover:bg-[#CDDC3C] dark:hover:text-[#141414]";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <MotionConfig reducedMotion="user">
      <div className="row-span-3 flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#141414] pb-4 border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] xl:row-span-6">
        {/* CARD HEADER */}
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Popular Products
          </h3>
          <div className="flex items-center gap-2">
            <button aria-label="More options" className={roundButton}>
              <EllipsisVertical className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button aria-label="Expand" className={roundButton}>
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {isLoading ? (
          <div className="flex flex-col gap-3 px-4 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl bg-gray-100 dark:bg-[#1E1E1E]"
              />
            ))}
          </div>
        ) : (
          /* PRODUCT LIST */
          <motion.div
            variants={list}
            initial="hidden"
            animate="show"
            className="flex-1 overflow-auto px-3"
          >
            {dashboardMetrics?.popularProducts.map((product) => (
              <motion.div
                key={product.productId}
                variants={row}
                className="group flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#1C1C1C]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 rounded-2xl bg-gray-100 dark:bg-[#1E1E1E] overflow-hidden border border-gray-100 dark:border-[#2A2A2A] p-1 flex items-center justify-center">
                    <Image
                      src={`${S3_ASSETS}/product${imageIndexFor(product.productId)}.png`}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="truncate text-[13px] font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-[#141414] dark:group-hover:text-[#CDDC3C] transition-colors">
                      {product.name}
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="font-bold text-[#141414] dark:text-[#CDDC3C]">
                        ${product.price}
                      </span>
                      <span className="mx-2 h-3 w-px bg-gray-300 dark:bg-zinc-700" />
                      <Rating rating={product.rating || 0} />
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1E1E1E] text-gray-700 dark:text-zinc-300 transition-colors group-hover:bg-[#CDDC3C] group-hover:text-[#141414]">
                    <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="whitespace-nowrap font-semibold">
                    {Math.round(product.stockQuantity / 1000)}k Sold
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
};

export default CardPopularProducts;