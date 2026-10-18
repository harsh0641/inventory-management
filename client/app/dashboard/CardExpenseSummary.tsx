"use client";

import {
  ExpenseByCategorySummary,
  useGetDashboardMetricsQuery,
} from "../state/api";
import { ArrowUpRight, EllipsisVertical, TrendingUp } from "lucide-react";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import React, { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type ExpenseSums = {
  [category: string]: number;
};

// ZAPR Brand Palette
const colors = ["#CDDC3C", "#A3B82C", "#7A8C1F", "#E6EE90", "#F4F7C5"];

const roundButton =
  "flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#CDDC3C] hover:text-[#141414] dark:bg-[#1E1E1E] dark:text-[#FFFFFF] dark:hover:bg-[#CDDC3C] dark:hover:text-[#141414]";

const cardClass =
  "row-span-3 flex flex-col justify-between rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]";

const formatMoney = (value: number) =>
  `$${value.toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Number that counts smoothly to its new value
const AnimatedMoney = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (v) => formatMoney(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.4,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, motionValue]);

  return <motion.span>{text}</motion.span>;
};

const CardExpenseSummary = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const expenseSummaryData = dashboardMetrics?.expenseSummary || [];

  const averageExpense =
    expenseSummaryData.length > 0
      ? expenseSummaryData.reduce((acc, curr) => acc + curr.totalExpenses, 0) /
        expenseSummaryData.length
      : 0;

  const expenseCategories = useMemo(() => {
    const sums = (dashboardMetrics?.expenseByCategorySummary || []).reduce(
      (acc: ExpenseSums, item: ExpenseByCategorySummary) => {
        const category = item.category + " Expenses";
        const amount = parseInt(item.amount, 10);
        if (!acc[category]) acc[category] = 0;
        acc[category] += amount;
        return acc;
      },
      {},
    );
    return Object.entries(sums).map(([name, value]) => ({ name, value }));
  }, [dashboardMetrics]);

  const totalExpenses = expenseCategories.reduce(
    (acc, category) => acc + category.value,
    0,
  );

  const active = activeIndex !== null ? expenseCategories[activeIndex] : null;
  const centerValue = active ? active.value : totalExpenses;
  const centerLabel = active ? active.name : "Total expenses";

  return (
    <MotionConfig reducedMotion="user">
      <div className={cardClass}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pb-3 pt-5 border-b border-gray-50 dark:border-[#222222]">
          <h2 className="text-base font-bold text-gray-900 dark:text-[#FFFFFF]">
            Expense Summary
          </h2>
          <div className="flex items-center gap-2">
            <button aria-label="More options" className={roundButton}>
              <EllipsisVertical className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button aria-label="Expand" className={roundButton}>
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center gap-4 px-6 pb-6 pt-2">
            <div className="h-[140px] w-[140px] animate-pulse rounded-full bg-gray-100 dark:bg-[#1E1E1E]" />
            <div className="flex flex-1 flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 animate-pulse rounded-full bg-gray-100 dark:bg-[#1E1E1E]"
                />
              ))}
            </div>
          </div>
        ) : expenseCategories.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-500 dark:text-zinc-400">
            No expenses recorded yet.
          </p>
        ) : (
          <>
            {/* BODY */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-4">
              {/* CHART */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative h-[150px] w-[150px] shrink-0 [&_*]:!outline-none"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      innerRadius={54}
                      outerRadius={66}
                      paddingAngle={5}
                      cornerRadius={8}
                      stroke="none"
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      startAngle={90}
                      endAngle={-270}
                      animationDuration={800}
                      animationEasing="ease-out"
                      onMouseEnter={(_: any, index: number) =>
                        setActiveIndex(index)
                      }
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                          style={{
                            opacity:
                              activeIndex === null || activeIndex === index
                                ? 1
                                : 0.3,
                            transition: "opacity 200ms ease",
                            cursor: "pointer",
                            filter:
                              activeIndex === index
                                ? `drop-shadow(0 0 8px ${colors[index % colors.length]}80)`
                                : "none",
                          }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <span className="line-clamp-1 text-[10px] font-medium text-gray-400 dark:text-zinc-400">
                    {centerLabel}
                  </span>
                  <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-[#FFFFFF]">
                    <AnimatedMoney value={centerValue} />
                  </span>
                </div>
              </motion.div>

              {/* LEGEND */}
              <ul className="flex min-w-[150px] flex-1 flex-col gap-1.5">
                {expenseCategories.map((entry, index) => {
                  const percent =
                    totalExpenses > 0
                      ? Math.round((entry.value / totalExpenses) * 100)
                      : 0;
                  return (
                    <li
                      key={`legend-${index}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      className={`flex cursor-default items-center justify-between gap-3 rounded-full px-3 py-1.5 text-xs transition-colors ${
                        activeIndex === index
                          ? "bg-[#CDDC3C]/15 dark:bg-[#CDDC3C]/20"
                          : "hover:bg-gray-50 dark:hover:bg-[#1E1E1E]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 text-gray-700 dark:text-zinc-300">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />
                        <span className="truncate font-medium">{entry.name}</span>
                      </span>
                      <span className="font-bold text-gray-900 dark:text-[#FFFFFF]">
                        {percent}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* FOOTER */}
            {expenseSummaryData.length > 0 && (
              <div className="flex items-center justify-between gap-2 px-6 pb-5 pt-3 text-xs border-t border-gray-50 dark:border-[#222222]">
                <span className="rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1.5 text-gray-500 dark:text-zinc-400">
                  Average:{" "}
                  <span className="font-bold text-gray-900 dark:text-[#FFFFFF]">
                    ${averageExpense.toFixed(2)}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#CDDC3C]/20 px-2.5 py-1.5 font-bold text-[#141414] dark:text-[#CDDC3C] border border-[#CDDC3C]/30">
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                  30%
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  );
};

export default CardExpenseSummary;