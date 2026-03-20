import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import Header from "./Header";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";

export default function Layout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useLoading();

  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/admin-login";

  useEffect(() => {
    const handleScroll = () => {
      if (!isAuthenticated && !hasShown && window.scrollY > 400) {
        setShowPopup(true);
        setHasShown(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated, hasShown]);

  useEffect(() => {
    setShowPopup(false);
  }, [location.pathname]);

  return (
    <>
      {!isLoading && <Header />}

      <main className={`min-h-screen ${!isHomePage && !isAuthPage ? 'pt-24' : ''}`}>
        <Outlet />
      </main>

      <Footer />

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white w-[92%] max-w-md rounded-3xl shadow-xl p-10 text-center relative"
            >
              {/* Close */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-black transition"
              >
                ✕
              </button>

              <h2 className="text-3xl mb-4">
                Join Our Community
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Create your account to access curated collections,
                exclusive releases and seamless checkout.
              </p>

              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate("/register");
                }}
                className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
              >
                Create Account
              </button>

              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 text-sm text-gray-500 hover:text-black transition"
              >
                Maybe Later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}