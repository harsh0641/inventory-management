"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useGetUsersQuery } from "../state/api";
import Header from "../(components)/Header/index";
import {
  Search,
  Download,
  ArrowUpDown,
  UserCheck,
  Shield,
  X,
  Check,
} from "lucide-react";

const S3_ASSETS =
  "https://s3-inventorymanagement14.s3.us-east-1.amazonaws.com/assets";

const imageIndexFor = (id: string | number) => {
  let hash = 0;
  for (const char of String(id)) {
    hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
  }
  return (hash % 3) + 1;
};

type SortField = "name" | "email" | "userId";

const Users = () => {
  const { data: users, isError, isLoading } = useGetUsersQuery();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manageUser, setManageUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState("Admin");

  // Sorting + Filtering
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users
      .filter((u: any) => {
        const matchesSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          String(u.userId).toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      })
      .sort((a: any, b: any) => {
        let valA = a[sortField] ?? "";
        let valB = b[sortField] ?? "";
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [users, search, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) setSelectedIds([]);
    else setSelectedIds(filteredUsers.map((u: any) => String(u.userId)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const list = selectedIds.length
      ? filteredUsers.filter((u: any) => selectedIds.includes(String(u.userId)))
      : filteredUsers;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Email"]
        .concat(list.map((u: any) => `"${u.userId}","${u.name}","${u.email}"`))
        .join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-sm font-medium text-gray-400 dark:text-zinc-500 animate-pulse">
        Loading user directory...
      </div>
    );
  }

  if (isError || !users) {
    return (
      <div className="p-8 text-sm font-bold text-rose-500">
        Failed to load users data. Please refresh.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-1 pb-24">
      <Header name="Users" />

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white dark:bg-[#141414] p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-[#242424]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-full bg-gray-50 dark:bg-[#1E1E1E] pl-9 pr-4 text-xs font-semibold text-gray-900 dark:text-[#FFFFFF] outline-none transition focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#CDDC3C]/20 focus:border-[#CDDC3C] border border-transparent dark:border-[#282828] placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="inline-flex rounded-full bg-gray-100 dark:bg-[#1E1E1E] p-0.5 text-xs font-bold border border-transparent dark:border-[#282828]">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1.5 transition-all ${
                filter === "all"
                  ? "bg-[#CDDC3C] text-[#141414] shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-[#FFFFFF]"
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
                filter === "active"
                  ? "bg-[#CDDC3C] text-[#141414] shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-[#FFFFFF]"
              }`}
            >
              <UserCheck className="h-3 w-3" />
              Active ({users.length})
            </button>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-gray-200 dark:border-[#282828] bg-white dark:bg-[#1E1E1E] px-4 text-xs font-semibold text-gray-700 dark:text-[#FFFFFF] transition hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#CDDC3C] active:scale-95 shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-gray-500 dark:text-zinc-400" />
          Export CSV
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-300 border-collapse">
            <thead className="bg-gray-50/75 dark:bg-[#1A1A1A] border-b border-gray-100 dark:border-[#242424] text-xs font-bold text-gray-900 dark:text-[#FFFFFF] uppercase tracking-wider">
              <tr>
                <th className="py-4 pl-6 pr-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 bg-transparent accent-[#CDDC3C] focus:ring-[#CDDC3C] cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => toggleSort("name")}
                  className="py-4 px-4 cursor-pointer hover:text-[#CDDC3C] transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    User
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("email")}
                  className="py-4 px-4 cursor-pointer hover:text-[#CDDC3C] transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Email
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("userId")}
                  className="py-4 px-4 cursor-pointer hover:text-[#CDDC3C] transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    User ID
                    <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                  </div>
                </th>
                <th className="py-4 px-4 select-none">Status</th>
                <th className="py-4 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#202020]">
              {filteredUsers.map((u: any) => {
                const idStr = String(u.userId);
                const isSelected = selectedIds.includes(idStr);

                return (
                  <tr
                    key={idStr}
                    className={`group transition-colors ${
                      isSelected
                        ? "bg-[#CDDC3C]/10 dark:bg-[#CDDC3C]/15"
                        : "hover:bg-gray-50/80 dark:hover:bg-[#1A1A1A]/70"
                    }`}
                  >
                    <td className="py-3.5 pl-6 pr-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(idStr)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-zinc-700 bg-transparent accent-[#CDDC3C] focus:ring-[#CDDC3C] cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={`${S3_ASSETS}/product${imageIndexFor(idStr)}.png`}
                          alt={u.name}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-2xl bg-gray-100 dark:bg-[#1E1E1E] object-contain p-1 border border-gray-100 dark:border-[#282828] shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm font-semibold text-gray-900 dark:text-[#FFFFFF] group-hover:text-[#CDDC3C] transition-colors">
                            {u.name}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400 dark:text-zinc-500">
                            Member
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-700 dark:text-zinc-200 text-[13px]">
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-400 dark:text-zinc-500">
                        {idStr.length > 12 ? `${idStr.slice(0, 8)}...` : idStr}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-[#CDDC3C]/20 text-[#141414] dark:text-[#CDDC3C] border border-[#CDDC3C]/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#CDDC3C]" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setManageUser(u)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-zinc-300 hover:text-[#141414] hover:bg-[#CDDC3C] px-3 py-1 rounded-full transition-all"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Permissions
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE PERMISSIONS MODAL */}
      {manageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#141414] p-6 shadow-2xl border border-gray-100 dark:border-[#242424] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#242424]">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF]">
                User Permissions
              </h3>
              <button
                onClick={() => setManageUser(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full p-1 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4">
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">Editing access for:</p>
              <p className="text-sm font-bold text-gray-900 dark:text-[#FFFFFF] mb-4">
                {manageUser.name}
              </p>

              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300 block mb-2 uppercase tracking-wider">
                Assign System Role
              </label>
              <div className="flex gap-2">
                {["Viewer", "Editor", "Admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRole(role)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                      userRole === role
                        ? "border-[#CDDC3C] bg-[#CDDC3C] text-[#141414]"
                        : "border-gray-200 dark:border-[#282828] text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#1E1E1E]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-[#242424]">
              <button
                onClick={() => setManageUser(null)}
                className="flex-1 rounded-full border border-gray-200 dark:border-[#282828] py-2 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setManageUser(null)}
                className="flex-1 rounded-full bg-[#CDDC3C] py-2 text-xs font-extrabold text-[#141414] hover:brightness-105 transition flex items-center justify-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING MULTI-SELECT ISLAND */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full bg-[#141414] dark:bg-[#1E1E1E] border border-[#282828] px-5 py-2.5 text-white shadow-2xl transition">
          <span className="text-xs font-medium text-zinc-300">
            <span className="font-extrabold text-[#CDDC3C]">
              {selectedIds.length}
            </span>{" "}
            selected
          </span>
          <div className="h-4 w-px bg-zinc-700" />
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 transition hover:text-[#CDDC3C]"
          >
            <Download className="h-3.5 w-3.5" />
            Export Selected
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-bold text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default Users;