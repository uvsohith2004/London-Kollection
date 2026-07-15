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
    <div className="container py-20 md:py-32">

      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-8 uppercase tracking-wide font-light">
        <Link to="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-gray-900 transition">
          Shop
        </Link>
        {validCategory && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-900">
              {validCategory.name}
            </span>
          </>
        )}
      </div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-display font-semibold mb-4"
      >
        {validCategory ? validCategory.name : "All Products"}
      </motion.h1>

      <p className="text-gray-600 text-sm mb-16 font-light">
        {displayProducts.length}{" "}
        {displayProducts.length === 1 ? "product" : "products"}
      </p>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3 mb-16">
        <Link
          to="/shop"
          className={`px-5 py-2.5 rounded-full text-xs font-medium transition ${
            !validCategory
              ? "bg-blue-600 text-white"
              : "border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600"
          }`}
        >
          All
        </Link>

        {categories.map((c) => (
          <Link
            key={c.name}
            to={`/shop/${c.name}`}
            className={`px-5 py-2.5 rounded-full text-xs font-medium transition ${
              validCategory?.name === c.name
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 lg:gap-12">
        {displayProducts.length > 0 ? (
          displayProducts.map((p) => (
            <ProductCard
              key={p._id || p.id}
              product={p as any}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-32 font-light">
            <p className="text-lg mb-2">No products found in this category.</p>
            <Link to="/shop" className="text-blue-600 hover:text-blue-700 font-medium">
              Browse all products →
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}