import { useParams, Link } from "react-router-dom";
import { categories } from "@/data/categories";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { useProductStore } from "@/store/productStore";
import { useEffect } from "react";

export default function ShopPage() {
  const { category } = useParams<{ category?: string }>();
  const { products, fetchProducts, isLoading, error } = useProductStore();

  const validCategory = categories.find((c) => c.name === category);

  useEffect(() => {
    fetchProducts({
      category: category || undefined,
    });
  }, [category, fetchProducts]);

  // Filter products based on category
  const displayProducts = products.filter((p) => {
    if (validCategory) {
      return p.category === validCategory.name && p.isActive !== false;
    }
    return p.isActive !== false;
  });

  return (
    <div className="container py-16">

      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
        <Link to="/" className="hover:text-black transition">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-black transition">
          Shop
        </Link>
        {validCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-black">
              {validCategory.name}
            </span>
          </>
        )}
      </div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-semibold mb-2"
      >
        {validCategory ? validCategory.name : "All Products"}
      </motion.h1>

      <p className="text-gray-500 text-sm mb-10">
        {displayProducts.length}{" "}
        {displayProducts.length === 1 ? "product" : "products"}
      </p>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        <Link
          to="/shop"
          className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
            !validCategory
              ? "bg-black text-white border-black"
              : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
          }`}
        >
          All
        </Link>

        {categories.map((c) => (
          <Link
            key={c.name}
            to={`/shop/${c.name}`}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
              validCategory?.name === c.name
                ? "bg-black text-white border-black"
                : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayProducts.length > 0 ? (
          displayProducts.map((p) => (
            <ProductCard
              key={p._id || p.id}
              product={p as any}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-20">
            No products found in this category.
          </div>
        )}
      </div>

    </div>
  );
}