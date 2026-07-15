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
            ? "backdrop-blur-md bg-white/95 border-b border-gray-200 py-4"
            : "bg-transparent py-4"
          : "backdrop-blur-md bg-white/98 border-b border-gray-200 py-4"
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
            className="logo-image h-10"
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className={`hidden xl:flex items-center gap-8 text-sm font-medium ${isHomePage && !scrolled ? "text-white" : "text-gray-700"}`}>
          {navLinks.slice(0, 4).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `transition duration-300 hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-semibold" : isHomePage && !scrolled ? "" : ""
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className={`flex items-center gap-6 ${isHomePage && !scrolled ? "text-white" : "text-gray-700"}`}>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="text-sm font-medium hover:text-blue-600 transition"
            >
              Sign In
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-1 hover:text-blue-600 transition text-xs"
              >
                <User size={16} />
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1 hover:text-blue-600 transition"
                  title="Admin Panel"
                >
                  <Shield size={16} />
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="hover:text-blue-600 transition"
              >
                <LogOut size={18} />
              </button>
            </>
          )}

          <Link to="/wishlist" className="hover:text-blue-600 transition">
            <Heart size={18} />
          </Link>

          <Link to="/cart" className="relative hover:text-blue-600 transition">
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
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
            className="fixed top-0 left-0 w-80 h-screen overflow-y-auto bg-white text-gray-900 z-40 shadow-2xl xl:hidden"
          >
            <div className="p-8 space-y-8">

              {/* USER SECTION */}
              {isAuthenticated ? (
                <div className="border-b border-gray-200 pb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Hello,</p>
                  <p className="text-lg font-display font-semibold">{user?.name}</p>
                </div>
              ) : (
                <div className="border-b border-gray-200 pb-6">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium inline-block"
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
                    className="flex items-center gap-3 hover:text-blue-600 transition"
                  >
                    <Settings size={18} />
                    Account Settings
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-blue-600 transition"
                  >
                    <Package size={18} />
                    Order History
                  </Link>

                  <Link
                    to="/track-order"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-blue-600 transition"
                  >
                    <Truck size={18} />
                    Track Orders
                  </Link>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 hover:text-blue-600 transition"
                  >
                    <Heart size={18} />
                    Wishlist
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 hover:text-blue-600 transition"
                    >
                      <Shield size={18} />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>

                </div>
              )}

              {/* CATEGORIES */}
              <div className="border-t border-gray-200 pt-6 space-y-3 text-sm">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="block hover:text-blue-600 transition font-medium"
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
