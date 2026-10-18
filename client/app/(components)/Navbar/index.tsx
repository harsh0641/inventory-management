"use client";

import React from "react";
import { Bell, Menu, Moon, Search, Settings, Sun } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/app/state";

// ZAPR circular button utility
const circleButton =
  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-all duration-200 hover:bg-[#CDDC3C] hover:text-[#141414] dark:bg-[#1E1E1E] dark:text-[#FFFFFF] dark:hover:bg-[#CDDC3C] dark:hover:text-[#141414]";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="mb-7 flex w-full items-center justify-between gap-3 rounded-full bg-white dark:bg-[#141414] px-3 py-2 border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      >
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile only: sidebar toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebar}
            aria-label="Open sidebar"
            className={`${circleButton} md:hidden`}
          >
            <Menu className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </motion.button>

          {/* Search Box */}
          <div className="group relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-400 transition-colors group-focus-within:text-[#141414] dark:group-focus-within:text-[#CDDC3C]"
              strokeWidth={1.8}
            />
            <input
              type="text"
              placeholder="Search products or groups"
              className="h-10 w-40 rounded-full border border-transparent bg-gray-100 dark:bg-[#1E1E1E] pl-11 pr-4 text-[13px] text-gray-900 dark:text-[#FFFFFF] outline-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-zinc-400 focus:border-[#CDDC3C] focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#CDDC3C]/20 sm:w-56 sm:focus:w-72 md:w-64 md:focus:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            className={`${circleButton} hidden md:flex`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDarkMode ? "sun" : "moon"}
                initial={{ rotate: -80, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 80, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {isDarkMode ? (
                  <Sun className="h-[18px] w-[18px] text-[#FFFFFF]" strokeWidth={1.8} />
                ) : (
                  <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Notifications Button with Lime Badge */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label="Notifications"
            className={`${circleButton} hidden md:flex`}
          >
            <Bell className="h-[18px] w-[18px] text-gray-700 dark:text-[#FFFFFF]" strokeWidth={1.8} />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 18,
                delay: 0.4,
              }}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CDDC3C] px-1 text-[10px] font-extrabold text-[#141414] ring-2 ring-white dark:ring-[#141414]"
            >
              3
            </motion.span>
          </motion.button>

          {/* Settings Shortcut */}
          <Link href="/settings" aria-label="Settings">
            <motion.span
              whileHover={{ rotate: 45 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className={circleButton}
            >
              <Settings className="h-[18px] w-[18px] text-gray-700 dark:text-[#FFFFFF]" strokeWidth={1.8} />
            </motion.span>
          </Link>

          {/* User Profile Pill - Forced raw #FFFFFF text in dark mode */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="flex cursor-pointer items-center gap-2.5 rounded-full bg-gray-100 dark:bg-[#1E1E1E] p-1 lg:pr-4 border border-transparent hover:border-[#CDDC3C]/40 transition-colors"
          >
            <Image
              src="https://s3-inventorymanagement14.s3.us-east-1.amazonaws.com/assets/profile.jpg"
              alt="Profile"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#CDDC3C]"
            />
            <span className="hidden text-[13px] font-bold text-gray-900 dark:text-[#FFFFFF] lg:block">
              Harsh Vora
            </span>
          </motion.div>
        </div>
      </motion.header>
    </MotionConfig>
  );
};

export default Navbar;