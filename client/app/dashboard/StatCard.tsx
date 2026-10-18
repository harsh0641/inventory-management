"use client";

import { LucideIcon } from "lucide-react";
import { MotionConfig, Variants, motion } from "motion/react";
import React from "react";

type StatDetail = {
  title: string;
  amount: string;
  changePercentage: number;
  IconComponent: LucideIcon;
};

type StatCardProps = {
  title: string;
  primaryIcon: React.ReactNode;
  details: StatDetail[];
  dateRange: string;
};

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

const StatCard = ({
  title,
  primaryIcon,
  details,
  dateRange,
}: StatCardProps) => {
  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? "+" : "";
    return `${signal}${value.toFixed()}%`;
  };

  const getChipColor = (value: number) =>
    value >= 0
      ? "bg-[#CDDC3C]/20 text-[#141414] dark:text-[#CDDC3C] border border-[#CDDC3C]/40"
      : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30";

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="col-span-1 flex flex-col justify-between rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-[0_8px_24px_rgba(205,220,60,0.12)] md:row-span-1 xl:row-span-2"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-4 border-b border-gray-50 dark:border-[#222222]">
          <h2 className="text-base font-bold text-gray-900 dark:text-[#FFFFFF]">
            {title}
          </h2>
          <span className="whitespace-nowrap rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1 text-[11px] font-medium text-gray-500 dark:text-zinc-400">
            {dateRange}
          </span>
        </div>

        {/* BODY */}
        <div className="mb-5 flex items-center gap-4 px-5 pt-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#CDDC3C]/15 text-[#141414] dark:text-[#CDDC3C] border border-[#CDDC3C]/25">
            {primaryIcon}
          </div>

          <motion.div
            variants={list}
            initial="hidden"
            animate="show"
            className="min-w-0 flex-1 divide-y divide-gray-100 dark:divide-[#222222]"
          >
            {details.map((detail, index) => (
              <motion.div
                key={index}
                variants={row}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-500 dark:text-zinc-400">
                  {detail.title}
                </span>
                <span className="text-sm font-extrabold text-gray-900 dark:text-[#FFFFFF]">
                  {detail.amount}
                </span>
                <span
                  className={`inline-flex min-w-[64px] items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${getChipColor(
                    detail.changePercentage,
                  )}`}
                >
                  <detail.IconComponent className="h-3.5 w-3.5" strokeWidth={2} />
                  {formatPercentage(detail.changePercentage)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  );
};

export default StatCard;