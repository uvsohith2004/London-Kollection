import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { categories } from "@/data/categories";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/store/productStore";
import { useEffect, useRef } from "react";

const WHATSAPP_NUMBER = "919885058098";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } }
};

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts } = useProductStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetchFeaturedProducts(5);
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    
    const loopDuration = 28;    
    const startTime = 7;        

const handleTimeUpdate = () => {
  if (video.currentTime >= loopDuration) {
    video.currentTime = startTime;  
    video.play();
  }
};

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const displayProducts = Array.isArray(featuredProducts)
    ? featuredProducts.slice(0, 5)
    : [];

  return (
    <div>

      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden">

        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Hero Content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center justify-start h-full text-center text-white px-6 pt-40"
        >

          {/* BRAND */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl font-bold tracking-wide mb-4"
          >
            LONDON KOLLECTION
          </motion.h1>

          {/* MINIMAL TAGLINE */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl mb-8 text-gray-200"
          >
            Gift & Novelties | Retail & Wholesale
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            variants={fadeUp}
            className="flex gap-4 flex-wrap justify-center"
          >
            <Link
              to="/shop"
              className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
            >
              SHOP NOW
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition transform hover:scale-105"
            >
              <MessageCircle size={18} className="inline mr-2" />
              WHATSAPP ORDER
            </a>
          </motion.div>

          {/* TRUST LINE */}
          <motion.div
            variants={fadeUp}
            className="mt-14 text-center"
          >
            <p className="text-sm md:text-base tracking-widest uppercase text-gray-200">
              Trusted globally since 2009
            </p>

            <div className="w-20 h-[2px] bg-red-600 mx-auto my-4" />

            <p className="text-sm md:text-base italic text-gray-300">
              Not mass produced. Precisely chosen.
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* CATEGORY SECTION */}
      <section className="py-20 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600">
            Explore our collection
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="container grid grid-cols-2 md:grid-cols-5 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              className="bg-white rounded-xl shadow hover:shadow-xl transition p-4 text-center cursor-pointer"
            >
              <Link to={`/shop/${cat.name}`}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-gray-800">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container flex justify-between items-center mb-10"
        >
          <h2 className="text-3xl font-bold text-red-600">
            Trending Products
          </h2>
          <Link
            to="/shop"
            className="text-blue-600 font-semibold hover:underline"
          >
            View All
          </Link>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="container grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {displayProducts.map((p) => (
            <motion.div
              key={p._id || p.id}
              variants={fadeUp}
              whileHover={{ y: -10 }}
            >
              <ProductCard product={p as any} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* WHATSAPP CTA */}
      <section className="py-20 bg-blue-900 text-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <MessageCircle size={40} className="mx-auto mb-4" />

          <h2 className="text-3xl font-bold mb-4">
            Prefer to Order via WhatsApp?
          </h2>

          <p className="mb-6">
            Message us directly and we’ll assist you instantly.
          </p>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
          >
            Chat Now
          </a>
        </motion.div>
      </section>

    </div>
  );
}