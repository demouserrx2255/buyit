"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/slices/productsSlice";
import Link from "next/link";
import RequireAuth from "./components/RequireAuth";
import { getImageUrl, formatPrice } from "../lib/utils";
import api from "@/lib/api";
import { fetchCart } from "@/store/slices/cartSlice";

export default function Home() {
  const dispatch = useDispatch();
  const { items, status, error, page, pages, params } = useSelector(
    (s) => s.products
  );
  const [search, setSearch] = useState(params.search || "");
  const [sort, setSort] = useState(params.sort || "-createdAt");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 10, sort }));
    api.get("/api/categories").then((res) => setCategories(res.data));
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: 1,
        limit: 10,
        sort,
        category:
          selectedCategory === "68afef76726fbc123d9f4ce6"
            ? null
            : selectedCategory,
      })
    );
  }, [selectedCategory]);

  const onSearch = (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ page: 1, limit: 10, sort, search }));
  };

  const onPage = (p) => {
    dispatch(fetchProducts({ page: p, limit: 10, sort, search }));
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-[85rem] px-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <div
          data-testid="hero-section"
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6"
        >
          <h1 className="text-4xl font-semibold text-black">
            Essentials for the way you live
          </h1>
        </div>

        {/* Categories */}
        <div
          className="flex gap-5 justify-center mx-auto my-6"
          data-testid="category-filter"
        >
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`cursor-pointer p-4 border rounded-lg shadow-sm transition flex justify-center flex-col items-center min-w-32 min-h-32 ${
                selectedCategory === cat._id
                  ? "border-black bg-gray-100"
                  : "border-gray-200"
              }`}
            >
              {cat.images?.length > 0 ? (
                <img
                  src={getImageUrl(cat.images[0])}
                  alt={cat.name}
                  className="w-14 h-14 object-cover"
                />
              ) : (
                <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
              <h3 className="mt-2 text-center text-base font-bold text-gray-800">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col justify-end sm:flex-row sm:items-end gap-3 my-6">
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              data-testid="search-input"
              className="border rounded px-3 py-2 w-64"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              data-testid="sort-select"
              className="border rounded px-3 py-2"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
            </select>
            <button
              type="submit"
              data-testid="search-button"
              className="bg-black text-white rounded px-4"
            >
              Search
            </button>
          </form>
        </div>

        {/* Products */}
        <div
          className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 gap-10"
          data-testid="product-grid"
        >
          {items.length === 0 && status !== "loading" ? (
            <p data-testid="no-products">No products found</p>
          ) : (
            items.map((p) => (
              <Link
                key={p._id}
                href={`/product/${p._id}`}
                data-testid="product-card"
                className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
              >
                {p.images?.length > 0 ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-50">
                    <img
                      data-testid="product-image"
                      src={getImageUrl(p.images[0])}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No image</span>
                  </div>
                )}

                <div className="mt-5">
                  <h2
                    data-testid="product-title"
                    className="text-xl font-medium text-gray-900 line-clamp-1"
                  >
                    {p.name}
                  </h2>
                  {p.price != null && (
                    <p
                      data-testid="product-price"
                      className="mt-1 text-sm font-semibold text-gray-700"
                    >
                      {formatPrice(p.price)}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded border ${
                  p === page ? "bg-black text-white" : "bg-white text-black"
                }`}
                onClick={() => onPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
