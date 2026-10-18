"use client";

import React, { useState } from "react";
import Header from "../(components)/Header";
import {
  User,
  Moon,
  Shield,
  Check,
  Save,
  RotateCcw,
} from "lucide-react";
import { MotionConfig, motion } from "motion/react";

type SettingItem = {
  id: string;
  label: string;
  description: string;
  value: string | boolean;
  type: "text" | "toggle" | "select";
  options?: string[];
  category: "Account" | "Preferences" | "System";
};

const initialSettings: SettingItem[] = [
  {
    id: "username",
    label: "Username",
    description: "Your display handle across inventory audits and user logs.",
    value: "harsh_vora",
    type: "text",
    category: "Account",
  },
  {
    id: "email",
    label: "Notification Email",
    description: "Receives inventory alerts, weekly summaries, and export links.",
    value: "hvora@umassd.edu",
    type: "text",
    category: "Account",
  },
  {
    id: "darkMode",
    label: "Dark Mode Appearance",
    description: "Switches interface theme between Obsidian Dark and Pure Light surfaces.",
    value: true,
    type: "toggle",
    category: "Preferences",
  },
  {
    id: "notifications",
    label: "Critical Stock Alerts",
    description: "Receive push notifications when SKU units drop below threshold.",
    value: true,
    type: "toggle",
    category: "Preferences",
  },
  {
    id: "language",
    label: "Interface Language",
    description: "Primary locale for numeric currency and metric abbreviations.",
    value: "English (US)",
    type: "select",
    options: ["English (US)", "English (UK)", "Spanish", "German"],
    category: "System",
  },
  {
    id: "twoFactor",
    label: "Two-Factor Verification",
    description: "Require security authentication on sign-in and user management changes.",
    value: false,
    type: "toggle",
    category: "System",
  },
];

const categoryIcons = {
  Account: User,
  Preferences: Moon,
  System: Shield,
};

const Settings = () => {
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, value: !item.value } : item
      )
    );
  };

  const handleTextChange = (id: string, nextValue: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, value: nextValue } : item
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleReset = () => {
    setSettings(initialSettings);
  };

  const categories: Array<"Account" | "Preferences" | "System"> = [
    "Account",
    "Preferences",
    "System",
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-6 px-2 md:px-6 pb-28 w-full max-w-5xl mx-auto min-h-screen pt-4">
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Header name="Settings" />
            <p className="text-[13px] font-medium text-gray-500 dark:text-zinc-400 mt-1">
              Configure personal profile, theme preferences, and security options.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#141414] px-4 text-xs font-semibold text-gray-700 dark:text-[#FFFFFF] transition hover:bg-gray-50 dark:hover:bg-[#1E1E1E] hover:border-[#CDDC3C] active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5 text-gray-400 dark:text-zinc-400" />
              Reset
            </button>

            <button
              onClick={handleSave}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#CDDC3C] px-5 text-xs font-bold text-[#141414] shadow-md transition hover:brightness-105 active:scale-95"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* SETTINGS SECTIONS */}
        <div className="flex flex-col gap-6">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat];
            const items = settings.filter((s) => s.category === cat);

            return (
              <div
                key={cat}
                className="rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                {/* SECTION HEADER */}
                <div className="flex items-center gap-3 px-6 py-4 bg-gray-50/70 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-[#242424]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CDDC3C]/15 text-[#141414] dark:text-[#CDDC3C] border border-[#CDDC3C]/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF]">
                    {cat} Configuration
                  </h3>
                </div>

                {/* SECTION ITEMS */}
                <div className="divide-y divide-gray-50 dark:divide-[#202020] px-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                    >
                      <div className="max-w-lg">
                        <label
                          htmlFor={item.id}
                          className="block text-sm font-semibold text-gray-900 dark:text-[#FFFFFF]"
                        >
                          {item.label}
                        </label>
                        <p className="text-xs text-gray-400 dark:text-zinc-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center">
                        {/* TOGGLE SWITCH */}
                        {item.type === "toggle" && (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.value as boolean}
                            onClick={() => handleToggle(item.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#CDDC3C]/30 ${
                              item.value
                                ? "bg-[#CDDC3C]"
                                : "bg-gray-200 dark:bg-[#282828]"
                            }`}
                          >
                            <motion.span
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className={`inline-block h-5 w-5 transform rounded-full shadow-md transition ${
                                item.value
                                  ? "translate-x-5 bg-[#141414]"
                                  : "translate-x-0.5 bg-white dark:bg-zinc-400"
                              }`}
                            />
                          </button>
                        )}

                        {/* TEXT INPUT */}
                        {item.type === "text" && (
                          <input
                            id={item.id}
                            type="text"
                            value={item.value as string}
                            onChange={(e) =>
                              handleTextChange(item.id, e.target.value)
                            }
                            className="h-9 w-full sm:w-64 rounded-xl bg-gray-50 dark:bg-[#1E1E1E] px-3.5 text-xs font-semibold text-gray-900 dark:text-[#FFFFFF] border border-gray-200 dark:border-[#282828] outline-none transition focus:bg-white dark:focus:bg-[#141414] focus:border-[#CDDC3C] focus:ring-2 focus:ring-[#CDDC3C]/20"
                          />
                        )}

                        {/* SELECT DROPDOWN */}
                        {item.type === "select" && (
                          <select
                            id={item.id}
                            value={item.value as string}
                            onChange={(e) =>
                              handleTextChange(item.id, e.target.value)
                            }
                            className="h-9 rounded-xl bg-gray-50 dark:bg-[#1E1E1E] px-3.5 pr-8 text-xs font-semibold text-gray-900 dark:text-[#FFFFFF] border border-gray-200 dark:border-[#282828] outline-none transition focus:border-[#CDDC3C] focus:ring-2 focus:ring-[#CDDC3C]/20"
                          >
                            {item.options?.map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                className="bg-white dark:bg-[#141414] text-gray-900 dark:text-[#FFFFFF]"
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MotionConfig>
  );
};

export default Settings;