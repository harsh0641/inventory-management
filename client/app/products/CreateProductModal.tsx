"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";
import { X, Plus, DollarSign, Package, Star } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState({
    productId: v4(),
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    setFormData({
      productId: v4(),
      name: "",
      price: 0,
      stockQuantity: 0,
      rating: 0,
    });
    onClose();
  };

  const labelStyles =
    "block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider";
  const inputStyles =
    "block w-full h-11 px-4 text-xs font-semibold rounded-2xl bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-[#FFFFFF] border border-gray-200 dark:border-[#2A2A2A] outline-none transition-all focus:border-[#CDDC3C] focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-[#CDDC3C]/20 placeholder:text-gray-400 dark:placeholder:text-zinc-500";

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* BACKDROP BLUR */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-[#141414]/70 backdrop-blur-sm"
            />

            {/* MODAL CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#141414] border border-gray-100 dark:border-[#242424] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] z-10"
            >
              {/* TOP CLOSE BUTTON */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1E1E1E] text-gray-600 dark:text-zinc-300 transition-colors hover:bg-[#CDDC3C] hover:text-[#141414]"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>

              <div className="pr-10">
                <Header name="Create New Product" />
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 font-medium">
                  Add a new inventory item to the catalog.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                {/* PRODUCT NAME */}
                <div>
                  <label htmlFor="productName" className={labelStyles}>
                    Product Name
                  </label>
                  <input
                    id="productName"
                    type="text"
                    name="name"
                    placeholder="e.g. Blazing Star Sneaker"
                    onChange={handleChange}
                    value={formData.name}
                    className={inputStyles}
                    required
                  />
                </div>

                {/* PRICE & STOCK QUANTITY ROW */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="productPrice" className={labelStyles}>
                      Price ($)
                    </label>
                    <div className="relative">
                      <input
                        id="productPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        name="price"
                        placeholder="0.00"
                        onChange={handleChange}
                        value={formData.price || ""}
                        className={inputStyles}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="stockQuantity" className={labelStyles}>
                      Stock Quantity
                    </label>
                    <input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      name="stockQuantity"
                      placeholder="0"
                      onChange={handleChange}
                      value={formData.stockQuantity || ""}
                      className={inputStyles}
                      required
                    />
                  </div>
                </div>

                {/* RATING */}
                <div>
                  <label htmlFor="rating" className={labelStyles}>
                    Initial Rating (1 - 5)
                  </label>
                  <input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    name="rating"
                    placeholder="e.g. 4.5"
                    onChange={handleChange}
                    value={formData.rating || ""}
                    className={inputStyles}
                    required
                  />
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-[#222222]">
                  <button
                    onClick={onClose}
                    type="button"
                    className="h-10 px-5 rounded-full border border-gray-200 dark:border-[#2A2A2A] bg-transparent text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors"
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="flex h-10 items-center justify-center gap-1.5 px-6 rounded-full bg-[#CDDC3C] text-[#141414] text-xs font-extrabold shadow-[0_2px_12px_rgba(205,220,60,0.3)] hover:brightness-105 transition-all"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    Create Item
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default CreateProductModal;