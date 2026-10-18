"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/app/state";
import {
  LucideIcon,
  Layout,
  Archive,
  User,
  SlidersHorizontal,
  Clipboard,
  CircleDollarSign,
  ChevronLeft,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isDesktop;
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathName = usePathname();
  const isActive =
    pathName === href ||
    (pathName === "/" && href === "/dashboard") ||
    pathName.startsWith(`${href}/`);

  return (
    <Link href={href} title={isCollapsed ? label : undefined}>
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className={`group relative flex h-11 items-center overflow-hidden rounded-full bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-colors ${
          isCollapsed ? "mx-auto w-11 justify-center" : "w-full gap-3 px-3.5"
        } ${
          isActive
            ? "text-[#141414] font-bold"
            : "text-gray-500 dark:text-zinc-300 hover:text-[#141414] dark:hover:text-[#CDDC3C]"
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-full bg-[#CDDC3C] shadow-[0_4px_16px_rgba(205,220,60,0.35)]"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
        )}
        <Icon
          className="relative h-[18px] w-[18px] shrink-0"
          strokeWidth={isActive ? 2.2 : 1.8}
        />
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.18 }}
              className="relative whitespace-nowrap text-[13px] font-semibold"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};

const links = [
  { href: "/dashboard", icon: Layout, label: "Dashboard" },
  { href: "/inventory", icon: Archive, label: "Inventory" },
  { href: "/products", icon: Clipboard, label: "Products" },
  { href: "/users", icon: User, label: "Users" },
  { href: "/settings", icon: SlidersHorizontal, label: "Settings" },
  { href: "/expenses", icon: CircleDollarSign, label: "Expenses" },
];

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDesktop = useIsDesktop();

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const collapsedWidth = isDesktop ? 72 : 0;
  const expandedWidth = isDesktop ? 232 : 280;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {!isDesktop && !isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-30 bg-[#141414]/60 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? collapsedWidth : expandedWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="fixed z-40 flex h-full flex-col overflow-hidden max-md:bg-white max-md:dark:bg-[#141414] max-md:shadow-2xl md:pt-5"
      >
        <div className="flex flex-col gap-5 px-3.5 pt-5 md:pt-0">
          <div className="flex h-11 items-center gap-3 overflow-hidden pl-0.5">
            <Image
              src="https://s3-inventorymanagement14.s3.us-east-1.amazonaws.com/assets/logo.png"
              alt="ZAPR logo"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <AnimatePresence initial={false}>
              {!isSidebarCollapsed && (
                <motion.h1
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-xl font-extrabold tracking-tight text-[#141414] dark:text-[#FFFFFF]"
                >
                  ZAPR
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.92 }}
            onClick={toggleSidebar}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#141414] text-gray-700 dark:text-[#FFFFFF] border border-gray-100 dark:border-[#242424] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-colors hover:text-[#141414] dark:hover:text-[#CDDC3C] hover:border-[#CDDC3C]/40"
          >
            <motion.span
              animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
              variants={{
                hover: { x: isSidebarCollapsed ? 2 : -2 },
              }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="flex"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
            </motion.span>
          </motion.button>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-3 px-3.5">
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              {...link}
              isCollapsed={isSidebarCollapsed}
            />
          ))}
        </nav>

        <AnimatePresence initial={false}>
          {!isSidebarCollapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-6 text-center text-[11px] font-medium text-gray-400 dark:text-zinc-500"
            >
              &copy; 2026 ZAPR. All rights reserved.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.aside>
    </MotionConfig>
  );
};

export default Sidebar;