import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Truck, Shield } from "lucide-react";
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
  show: { transition: { staggerChildren: 0.15 } }
};

export default function HomePage() {
  const { featuredProducts, fetchFeaturedProducts } = useProductStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetchFeaturedProducts(6);
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
    ? featuredProducts.slice(0, 6)
    : [];

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
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

        {/* Overlay with gradient depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-transparent backdrop-blur-sm" />

        {/* Hero Content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 h-full flex items-center px-6 md:px-16"
        >
          <div className="max-w-xl">
            {/* BRAND HEADING*/}
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-display font-semibold text-white leading-tight tracking-wide mb-6"
            >
              Elegance in Every Detail
            </motion.h1>

            {/* SUBTEXT */}
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-gray-100 font-light leading-relaxed mb-10"
            >
              Curated collections of premium jewellery and accessories designed for the modern luxury enthusiast.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/shop"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold transition duration-300 transform hover:scale-105"
              >
                Explore Collection
              </Link>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full font-semibold transition duration-300"
              >
                <MessageCircle size={18} className="mr-2" />
                WhatsApp
              </a>
            </motion.div>

            {/* TRUST MARKER */}
            <motion.div
              variants={fadeUp}
              className="mt-16 space-y-3"
            >
              <div className="flex items-center gap-3 text-gray-200">
                <div className="w-12 h-[1px] bg-gray-300" />
                <span className="text-sm uppercase tracking-widest font-light">Trusted Since 2009</span>
              </div>
              <p className="text-sm text-gray-300 italic">
                Precision. Elegance. Authenticity.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== BRAND STATEMENT SECTION ===== */}
      <section className="py-32 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container max-w-3xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-gray-900 mb-6 leading-tight">
            Designed for Everyday Elegance
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed font-light">
            Each piece is thoughtfully selected to bring timeless sophistication to your collection. 
            We believe in quality over quantity, purpose over excess.
          </p>
        </motion.div>
      </section>

      {/* ===== FEATURED COLLECTION ===== */}
      <section className="py-32 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-gray-900 mb-4">
              Featured Collection
            </h2>
            <p className="text-gray-600 font-light">Handpicked essentials for the discerning taste</p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12"
          >
            {displayProducts.slice(0, 6).map((p) => (
              <motion.div
                key={p._id || p.id}
                variants={fadeUp}
              >
                <ProductCard product={p as any} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-20"
          >
            <Link
              to="/shop"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-lg transition"
            >
              View Full Collection
              <span className="ml-2">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== WHY CHOOSE US SECTION ===== */}
      <section className="py-32 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 font-light">Committed to excellence in every aspect</p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              {
                icon: Sparkles,
                title: "Premium Quality",
                description: "Each item is carefully selected for authenticity and craftsmanship."
              },
              {
                icon: Truck,
                title: "Swift Delivery",
                description: "Fast, reliable shipping to get your treasures to you promptly."
              },
              {
                icon: Shield,
                title: "Trusted Brand",
                description: "Over 15 years of trusted service to luxury enthusiasts worldwide."
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <Icon className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 font-light leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-32 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container"
        >
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-gray-900 mb-4">
              Loved by Customers
            </h2>
            <p className="text-gray-600 font-light">Real stories from our valued clients</p>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {[
              {
                name: "Sarah M.",
                text: "Exceptional quality and attention to detail. Every piece feels like a work of art."
              },
              {
                name: "Fatima K.",
                text: "The service is impeccable. Delivery was faster than expected and packaging was beautiful."
              },
              {
                name: "Amira A.",
                text: "I've been a loyal customer for years. London Kollection never disappoints."
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="bg-white rounded-2xl p-8 shadow-soft"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-blue-600 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 font-light leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {testimonial.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-32 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="container text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6">
            Ready to Elevate Your Style?
          </h2>
          <p className="text-lg text-blue-100 mb-12 max-w-2xl mx-auto font-light">
            Connect with us via WhatsApp for personalized recommendations and exclusive offers.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-full font-semibold transition duration-300 transform hover:scale-105"
          >
            <MessageCircle size={20} className="mr-2" />
            Connect with Us
          </a>
        </motion.div>
      </section>

    </div>
  );
}
