"use client";

import { useGetDashboardMetricsQuery } from "../state/api";
import {
  ArrowUpRight,
  EllipsisVertical,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import numeral from "numeral";
import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ZAPR Brand Accent
const ACCENT = "#CDDC3C";

const roundButton =
  "flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#CDDC3C] hover:text-[#141414] dark:bg-[#1E1E1E] dark:text-[#FFFFFF] dark:hover:bg-[#CDDC3C] dark:hover:text-[#141414]";

const cardClass =
  "row-span-2 col-span-1 flex flex-col justify-between rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] md:col-span-2 xl:col-span-1 xl:row-span-3";

const formatMoney = (value: number) => numeral(value).format("$0.00a");

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTick = (date: string) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// Number that counts smoothly to its new value
const AnimatedValue = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (v) => formatMoney(v));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.45,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [value, motionValue]);

  return <motion.span>{text}</motion.span>;
};

const ChangeChip = ({ value }: { value: number }) => {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
        positive
          ? "bg-[#CDDC3C]/20 text-[#141414] dark:text-[#CDDC3C] border border-[#CDDC3C]/40"
          : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      {positive ? "+" : "-"}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
};

const PurchaseTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const change = point.changePercentage ?? 0;
  const positive = change >= 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] px-3.5 py-2.5 shadow-xl">
      <p className="text-[10px] font-medium text-gray-400 dark:text-zinc-400">{formatDate(point.date)}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF]">
        ${Math.round(point.totalPurchased).toLocaleString("en")}
      </p>
      <p
        className={`text-[11px] font-semibold ${
          positive ? "text-emerald-500 dark:text-[#CDDC3C]" : "text-red-500 dark:text-red-400"
        }`}
      >
        {positive ? "+" : "-"}
        {Math.abs(change).toFixed(2)}%
      </p>
    </div>
  );
};

const CardPurchaseSummary = () => {
  const { data, isLoading } = useGetDashboardMetricsQuery();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const purchaseData = useMemo(
    () =>
      [...(data?.purchaseSummary || [])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [data],
  );

  const display =
    purchaseData[hoveredIndex ?? (purchaseData.length > 0 ? purchaseData.length - 1 : 0)] ?? null;

  const caption = display
    ? hoveredIndex === null
      ? `${formatDate(display.date)} (latest)`
      : formatDate(display.date)
    : "Purchased";

  const handleHover = (state: any) => {
    if (typeof state?.activeTooltipIndex === "number") {
      setHoveredIndex(state.activeTooltipIndex);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cardClass}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pb-3 pt-5 border-b border-gray-50 dark:border-[#222222]">
          <h2 className="text-base font-bold text-gray-900 dark:text-[#FFFFFF]">
            Purchase Summary
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
          <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-2">
            <div className="h-12 w-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#1E1E1E]" />
            <div className="h-[160px] animate-pulse rounded-2xl bg-gray-100 dark:bg-[#1E1E1E]" />
          </div>
        ) : !display ? (
          <p className="px-6 pb-6 text-sm text-gray-500 dark:text-zinc-400">
            No purchases recorded yet.
          </p>
        ) : (
          <>
            {/* VALUE */}
            <div className="px-6 pt-4">
              <p className="text-xs font-medium text-gray-400 dark:text-zinc-400">{caption}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-[#FFFFFF]">
                  <AnimatedValue value={display.totalPurchased} />
                </span>
                <ChangeChip value={display.changePercentage ?? 0} />
              </div>
            </div>

            {/* CHART */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-auto w-full pt-2 text-gray-400 dark:text-zinc-500 [&_*]:!outline-none [&_.recharts-area-curve]:[filter:drop-shadow(0_4px_8px_rgba(205,220,60,0.35))]"
            >
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart
                  data={purchaseData}
                  margin={{ top: 12, right: 16, left: 16, bottom: 0 }}
                  onMouseMove={handleHover}
                  onClick={handleHover}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <defs>
                    <linearGradient
                      id="purchase-fill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatTick}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 12, fill: "currentColor" }}
                  />
                  <YAxis hide domain={[0, "dataMax"]} />
                  <Tooltip
                    content={<PurchaseTooltip />}
                    cursor={false}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <ReferenceLine
                    x={display.date}
                    stroke={ACCENT}
                    strokeOpacity={0.4}
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPurchased"
                    stroke={ACCENT}
                    strokeWidth={2.5}
                    fill="url(#purchase-fill)"
                    dot={false}
                    activeDot={false}
                    isAnimationActive
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                  <ReferenceDot
                    x={display.date}
                    y={display.totalPurchased}
                    r={6}
                    fill="#141414"
                    stroke={ACCENT}
                    strokeWidth={3}
                    isFront
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
      </div>
    </MotionConfig>
  );
};

export default CardPurchaseSummary;