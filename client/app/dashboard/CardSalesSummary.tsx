"use client";

import { useGetDashboardMetricsQuery } from "../state/api";
import {
  ArrowUpRight,
  ChevronDown,
  EllipsisVertical,
  TrendingDown,
  Check,
  TrendingUp,
} from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

type Timeframe = "daily" | "weekly" | "monthly";

type Point = {
  key: string;
  label: string;
  fullLabel: string;
  totalValue: number;
  changePercentage: number;
};

// ZAPR Brand Tokens
const ACCENT = "#CDDC3C"; // Electric Lime
const HATCH = "#CDDC3C";

const roundButton =
  "flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-[#CDDC3C] hover:text-[#141414] dark:bg-[#1E1E1E] dark:text-[#FFFFFF] dark:hover:bg-[#CDDC3C] dark:hover:text-[#141414]";

const cardClass =
  "row-span-3 flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] xl:row-span-6";

const UNITS: Record<Timeframe, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

const pad = (n: number) => String(n).padStart(2, "0");

const startOfWeek = (date: Date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d;
};

const shortDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
const longDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });

const formatValue = (value: number) =>
  Math.abs(value) >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(2)}m`
    : `$${(value / 1_000).toFixed(1)}k`;

// Group raw sales rows into daily, weekly or monthly points
const aggregate = (
  rows: {
    date: string;
    totalValue: number;
    changePercentage?: number | null;
  }[],
  timeframe: Timeframe,
): Point[] => {
  const groups = new Map<
    string,
    { anchor: Date; total: number; change: number; count: number }
  >();

  rows.forEach((row) => {
    const date = new Date(row.date);
    const anchor =
      timeframe === "weekly"
        ? startOfWeek(date)
        : timeframe === "monthly"
          ? new Date(date.getFullYear(), date.getMonth(), 1)
          : new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const key = `${anchor.getFullYear()}-${pad(anchor.getMonth() + 1)}-${pad(anchor.getDate())}`;
    const group = groups.get(key) ?? { anchor, total: 0, change: 0, count: 0 };
    group.total += row.totalValue;
    group.change += row.changePercentage ?? 0;
    group.count += 1;
    groups.set(key, group);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, g]) => ({
      key,
      totalValue: g.total,
      changePercentage: g.change / g.count,
      label:
        timeframe === "monthly"
          ? g.anchor.toLocaleDateString("en-US", { month: "short" })
          : shortDate(g.anchor),
      fullLabel:
        timeframe === "monthly"
          ? g.anchor.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : timeframe === "weekly"
            ? `Week of ${longDate(g.anchor)}`
            : longDate(g.anchor),
    }));
};

// Number that counts smoothly to its new value
const AnimatedValue = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (v) => formatValue(v));

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
      {positive ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

// Thin pill bar: hatched when idle, solid Electric Lime when active
const PillBar = (props: any) => {
  const { x, y, width, height, active } = props;
  if (!height || height <= 0) return null;
  const rx = Math.min(width / 2, height / 2);

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={rx}
      fill={active ? ACCENT : "url(#sales-hatch)"}
      style={{ transition: "fill 200ms ease" }}
    />
  );
};

const SalesTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const point: Point = payload[0].payload;
  const positive = point.changePercentage >= 0;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] px-3.5 py-2.5 shadow-xl">
      <p className="text-[10px] font-medium text-gray-400 dark:text-zinc-400">{point.fullLabel}</p>
      <p className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF]">
        ${Math.round(point.totalValue).toLocaleString("en")}
      </p>
      <p
        className={`text-[11px] font-semibold ${
          positive ? "text-emerald-500 dark:text-[#CDDC3C]" : "text-red-500 dark:text-red-400"
        }`}
      >
        {positive ? "+" : ""}
        {point.changePercentage.toFixed(2)}%
      </p>
    </div>
  );
};

const OPTIONS: { value: Timeframe; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const TimeframeSelect = ({
  value,
  onChange,
}: {
  value: Timeframe;
  onChange: (value: Timeframe) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[1];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-full border border-gray-200 dark:border-[#2A2A2A] bg-gray-100 dark:bg-[#1E1E1E] pl-4 pr-3 text-xs font-semibold text-gray-700 dark:text-[#FFFFFF] outline-none transition-colors hover:border-[#CDDC3C] focus-visible:border-[#CDDC3C]"
      >
        {current.label}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex text-gray-500 dark:text-zinc-400"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-2xl bg-white dark:bg-[#1E1E1E] p-1.5 border border-gray-100 dark:border-[#2A2A2A] shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          >
            {OPTIONS.map((option) => {
              const selected = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                      selected
                        ? "bg-[#CDDC3C] text-[#141414]"
                        : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#282828]"
                    }`}
                  >
                    {option.label}
                    {selected && (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const CardSalesSummary = () => {
  const { data, isLoading, isError } = useGetDashboardMetricsQuery();

  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const points = useMemo(
    () => aggregate(data?.salesSummary || [], timeframe),
    [data, timeframe],
  );

  const lastIndex = points.length > 0 ? points.length - 1 : 0;
  const activeIndex = hoveredIndex ?? lastIndex;
  const display = points[activeIndex];

  const highestIndex = points.reduce(
    (best, p, i, arr) => (p.totalValue > arr[best].totalValue ? i : best),
    0,
  );
  const highestLabel = points[highestIndex]?.fullLabel ?? "N/A";

  const handleTimeframe = (value: Timeframe) => {
    setHoveredIndex(null);
    setTimeframe(value);
  };

  const handleHover = (state: any) => {
    if (typeof state?.activeTooltipIndex === "number") {
      setHoveredIndex(state.activeTooltipIndex);
    }
  };

  if (isError) {
    return (
      <div className={cardClass}>
        <p className="m-6 text-sm text-gray-500 dark:text-zinc-400">
          Sales data failed to load. Refresh the page to try again.
        </p>
      </div>
    );
  }

  const count = points.length;
  const countLabel = `${count} ${UNITS[timeframe]}${count === 1 ? "" : "s"}`;
  const caption =
    hoveredIndex === null
      ? `${display?.fullLabel ?? ""} (latest)`
      : (display?.fullLabel ?? "");

  return (
    <MotionConfig reducedMotion="user">
      <div className={cardClass}>
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pb-3 pt-5 border-b border-gray-50 dark:border-[#222222]">
          <h2 className="text-base font-bold text-gray-900 dark:text-[#FFFFFF]">
            Sales Summary
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
            <div className="min-h-[220px] flex-1 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#1E1E1E]" />
          </div>
        ) : !display ? (
          <p className="px-6 pb-6 text-sm text-gray-500 dark:text-zinc-400">
            No sales recorded yet.
          </p>
        ) : (
          <>
            {/* VALUE + TIMEFRAME */}
            <div className="flex items-start justify-between gap-3 px-6 pt-4">
              <div>
                <p className="text-xs font-medium text-gray-400 dark:text-zinc-400">{caption}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                  <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-[#FFFFFF]">
                    <AnimatedValue value={display.totalValue} />
                  </span>
                  <ChangeChip value={display.changePercentage} />
                </div>
              </div>
              <TimeframeSelect value={timeframe} onChange={handleTimeframe} />
            </div>

            {/* CHART */}
            <div className="relative min-h-[260px] flex-1 text-gray-400 dark:text-zinc-500 [&_*]:!outline-none [&_.recharts-line-curve]:[filter:drop-shadow(0_4px_8px_rgba(205,220,60,0.3))]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={timeframe}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute inset-0 px-4 pt-4"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={points}
                      margin={{ top: 16, right: 16, left: 16, bottom: 0 }}
                      barCategoryGap="30%"
                      onMouseMove={handleHover}
                      onClick={handleHover}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <defs>
                        <pattern
                          id="sales-hatch"
                          patternUnits="userSpaceOnUse"
                          width="6"
                          height="6"
                          patternTransform="rotate(45)"
                        >
                          <rect
                            width="6"
                            height="6"
                            fill={HATCH}
                            fillOpacity={0.08}
                          />
                          <line
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="6"
                            stroke={HATCH}
                            strokeWidth="2"
                            strokeOpacity={0.4}
                          />
                        </pattern>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={{
                          stroke: "currentColor",
                          strokeOpacity: 0.2,
                        }}
                        tickMargin={10}
                        tick={{ fontSize: 12, fill: "currentColor" }}
                      />
                      <Tooltip
                        content={<SalesTooltip />}
                        cursor={{
                          stroke: HATCH,
                          strokeDasharray: "4 4",
                          strokeOpacity: 0.6,
                        }}
                        wrapperStyle={{ outline: "none" }}
                      />
                      <Bar
                        dataKey="totalValue"
                        maxBarSize={14}
                        animationDuration={600}
                        animationEasing="ease-out"
                        shape={(p: any) => (
                          <PillBar {...p} active={p.index === activeIndex} />
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalValue"
                        stroke={ACCENT}
                        strokeOpacity={0.8}
                        strokeWidth={2}
                        dot={{
                          r: 3,
                          fill: "#141414",
                          stroke: ACCENT,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: ACCENT,
                          stroke: "#141414",
                          strokeWidth: 3,
                        }}
                        animationDuration={800}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* FOOTER */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 pb-5 pt-3 text-xs text-gray-500 dark:text-zinc-400 border-t border-gray-50 dark:border-[#222222]">
              <span className="rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1.5 font-medium dark:text-zinc-300">
                {countLabel}
              </span>
              <span className="rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1.5 dark:text-zinc-300">
                Highest:{" "}
                <span className="font-bold text-gray-900 dark:text-[#FFFFFF]">
                  {highestLabel}
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </MotionConfig>
  );
};

export default CardSalesSummary;