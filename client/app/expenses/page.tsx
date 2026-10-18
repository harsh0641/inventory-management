"use client";

import { useMemo, useState } from "react";
import {
  ExpenseByCategorySummary,
  useGetExpensesByCategoryQuery,
} from "../state/api";
import Header from "../(components)/Header";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Calendar, Filter, PieChart as PieIcon } from "lucide-react";
import { MotionConfig, motion } from "motion/react";

type AggregatedDataItem = {
  name: string;
  color: string;
  amount: number;
};
type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

// ZAPR Graded Chart Palette
const ZAPR_CHART_COLORS = [
  "#CDDC3C", // Primary Electric Lime
  "#E2EE75", 
  "#A2B21C", 
  "#717F0D", 
  "#444C07", 
  "#F2F7A8",
];

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();
  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    let colorIdx = 0;
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount, 10) || 0;
        if (!acc[data.category]) {
          acc[data.category] = {
            name: data.category,
            amount: 0,
            color: ZAPR_CHART_COLORS[colorIdx % ZAPR_CHART_COLORS.length],
          };
          colorIdx++;
        }
        acc[data.category].amount += amount;
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const totalExpenseSum = useMemo(() => {
    return aggregatedData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [aggregatedData]);

  const active = activeIndex !== null ? aggregatedData[activeIndex] : null;
  const centerValue = active ? active.amount : totalExpenseSum;
  const centerLabel = active ? active.name : "Total Expenses";

  const classNames = {
    label: "block text-[11px] font-bold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider",
    input:
      "w-full h-10 px-3.5 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-[#FFFFFF] border border-gray-200 dark:border-[#282828] outline-none transition focus:bg-white dark:focus:bg-[#141414] focus:border-[#CDDC3C] focus:ring-2 focus:ring-[#CDDC3C]/20",
  };

  const CustomTooltip = ({ active: isTooltipActive, payload }: any) => {
    if (!isTooltipActive || !payload?.length) return null;
    const data = payload[0].payload;
    const percent =
      totalExpenseSum > 0
        ? ((data.amount / totalExpenseSum) * 100).toFixed(1)
        : "0";

    return (
      <div className="rounded-2xl bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#282828] p-3 shadow-xl">
        <p className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">
          {data.name}
        </p>
        <p className="text-sm font-black text-gray-900 dark:text-[#FFFFFF]">
          ${data.amount.toLocaleString("en")}
        </p>
        <p className="text-[11px] font-bold text-[#141414] dark:text-[#CDDC3C] mt-0.5">
          {percent}% of view
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 text-sm font-medium text-gray-400 dark:text-zinc-500 animate-pulse">
        Loading expenses records...
      </div>
    );
  }

  if (isError || !expensesData) {
    return (
      <div className="p-8 text-sm font-bold text-rose-500">
        Failed to fetch expense metrics. Please refresh the page.
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-6 px-1 pb-24 w-full min-h-screen">
        {/* HEADER */}
        <div>
          <Header name="Expenses" />
          <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
            Visual aggregation and category breakdown of operational expenditures.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* FILTERS PANEL */}
          <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-[#242424]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CDDC3C]/15 text-[#141414] dark:text-[#CDDC3C]">
                  <Filter className="h-4 w-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF]">
                  Filter Parameters
                </h3>
              </div>

              <div className="space-y-4">
                {/* CATEGORY SELECT */}
                <div>
                  <label htmlFor="category" className={classNames.label}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className={classNames.input}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Office">Office</option>
                    <option value="Professional">Professional</option>
                    <option value="Salaries">Salaries</option>
                  </select>
                </div>

                {/* START DATE */}
                <div>
                  <label htmlFor="start-date" className={classNames.label}>
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="start-date"
                      name="start-date"
                      value={startDate}
                      className={classNames.input}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* END DATE */}
                <div>
                  <label htmlFor="end-date" className={classNames.label}>
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="end-date"
                      name="end-date"
                      value={endDate}
                      className={classNames.input}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RESET ACTION */}
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-[#242424]">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full h-10 rounded-full border border-gray-200 dark:border-[#282828] bg-gray-50 dark:bg-[#1E1E1E] text-xs font-bold text-gray-700 dark:text-zinc-300 hover:border-[#CDDC3C] transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* DONUT CHART PANEL */}
          <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] p-6 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#242424]">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CDDC3C]/15 text-[#141414] dark:text-[#CDDC3C]">
                  <PieIcon className="h-4 w-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF]">
                  Distribution Breakdown
                </h3>
              </div>
              <span className="rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-3 py-1 text-[11px] font-bold text-gray-600 dark:text-zinc-300">
                {aggregatedData.length} Active Segment{aggregatedData.length === 1 ? "" : "s"}
              </span>
            </div>

            {aggregatedData.length === 0 ? (
              <div className="flex flex-1 items-center justify-center py-20 text-xs font-semibold text-gray-400 dark:text-zinc-500">
                No expense records match the specified filters.
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between flex-1 gap-6 pt-4">
                {/* CHART CONTAINER WITH CENTER VALUE */}
                <div className="relative w-full md:w-1/2 h-[320px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aggregatedData}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={115}
                        paddingAngle={4}
                        cornerRadius={8}
                        stroke="none"
                        dataKey="amount"
                        nameKey="name"
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {aggregatedData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            style={{
                              opacity:
                                activeIndex === null || activeIndex === index
                                  ? 1
                                  : 0.35,
                              transition: "all 200ms ease",
                              cursor: "pointer",
                              filter:
                                activeIndex === index
                                  ? `drop-shadow(0 0 10px ${entry.color}90)`
                                  : "none",
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* CENTER METRIC */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400 truncate max-w-[130px]">
                      {centerLabel}
                    </span>
                    <span className="text-2xl font-black text-gray-900 dark:text-[#FFFFFF] mt-0.5">
                      ${centerValue.toLocaleString("en")}
                    </span>
                  </div>
                </div>

                {/* INTERACTIVE LEGEND LIST */}
                <div className="w-full md:w-1/2 flex flex-col gap-2">
                  {aggregatedData.map((item, index) => {
                    const percentage =
                      totalExpenseSum > 0
                        ? ((item.amount / totalExpenseSum) * 100).toFixed(1)
                        : "0";
                    const isSelected = activeIndex === index;

                    return (
                      <div
                        key={item.name}
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#CDDC3C]/15 dark:bg-[#CDDC3C]/20 border border-[#CDDC3C]/30"
                            : "bg-gray-50 dark:bg-[#1A1A1A] border border-transparent hover:border-gray-200 dark:hover:border-[#282828]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs font-bold text-gray-900 dark:text-[#FFFFFF] truncate">
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-black text-gray-900 dark:text-[#FFFFFF]">
                            ${item.amount.toLocaleString()}
                          </span>
                          <span className="min-w-[42px] text-right text-[11px] font-bold text-[#141414] dark:text-[#CDDC3C]">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
};

export default Expenses;