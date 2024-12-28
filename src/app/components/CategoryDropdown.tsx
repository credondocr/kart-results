"use client";

import { Category } from "@/types/types";
import { useState, useEffect } from "react";


export default function CategoryDropdown({
  onCategoryChange,
}: {
  onCategoryChange: (category: Category | null) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(
          data.data.map((category: any) => ({
            id: category.id,
            name: category.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(event.target.value);
    const category = categories.find((c) => c.id === selectedId) || null;
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div>
      <label htmlFor="category">Select Category:</label>
      <select
        id="category"
        value={selectedCategory?.id || ""}
        onChange={handleChange}
      >
        <option value="">-- Select a Category --</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}