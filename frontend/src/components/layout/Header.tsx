import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Package,
  Truck,
  Settings,
  Shield,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import useAuthStore from "@/store/authStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Bangles", to: "/shop/Bangles" },
  { label: "Necklaces", to: "/shop/Necklaces" },
  { label: "Earrings", to: "/shop/Earrings" },
  { label: "Watches", to: "/shop/Watches" },
  { label: "Handbags", to: "/shop/Handbags" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = useCartStore((s) => s.itemCount());
  const { isAuthenticated, user, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isHomePage
          ? scrolled
            ? "backdrop-blur-lg bg-black/40 py-0"
            : "bg-transparent py-0"
          : "backdrop-blur-lg bg-black/70 py-0"
      }`}
    >
      <div className="container flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center overflow-visible"
        >
          <img 
            src="https://res.cloudinary.com/de0zbi6aj/image/upload/v1773133976/ChatGPT_Image_Mar_9_2026_09_12_48_PM_xdrt3z.png"
            alt="London Collection Logo"
            className="logo-image"
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-white">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `transition hover:text-red-400 ${
                  isActive ? "text-red-400" : ""
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 text-white">

          {!isAuthenticated && (
            <Link
              to="/login"
              className="flex items-center gap-1 hover:text-red-400 transition"
            >
              <LogIn size={18} />
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-1 hover:text-red-400 transition"
              >
                <User size={16} />
                <span className="text-xs">{user?.name}</span>
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1 hover:text-red-400 transition"
                  title="Admin Panel"
                >
                  <Shield size={18} />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="hover:text-red-400 transition"
              >
                <LogOut size={18} />
              </button>
            </>
          )}

          <Link to="/wishlist" className="hover:text-red-400 transition">
            <Heart size={20} />
          </Link>

          <Link to="/cart" className="relative hover:text-red-400 transition">
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-80 h-screen overflow-y-auto bg-black text-white z-50 shadow-2xl xl:hidden"
          >
            <div className="p-6 space-y-8">

              {/* USER SECTION */}
              {isAuthenticated ? (
                <div className="border-b border-white/20 pb-6">
                  <p className="text-sm text-white/70">Hello,</p>
                  <p className="text-lg font-semibold">{user?.name}</p>
                </div>
              ) : (
                <div className="border-b border-white/20 pb-6">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* ACCOUNT LINKS */}
              {isAuthenticated && (
                <div className="space-y-4 text-sm">

                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-red-400 transition"
                  >
                    <Settings size={18} />
                    Shipping Details
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-red-400 transition"
                  >
                    <Package size={18} />
                    Order History
                  </Link>

                  <Link
                    to="/track-order"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-red-400 transition"
                  >
                    <Truck size={18} />
                    Track Orders
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-red-400 transition"
                  >
                    <Heart size={18} />
                    Wishlist
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 hover:text-red-400 transition"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 text-red-400"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>

                </div>
              )}

              {/* CATEGORIES */}
              <div className="border-t border-white/20 pt-6 space-y-4 text-sm">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="block hover:text-red-400 transition"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
