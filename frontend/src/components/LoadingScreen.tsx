import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";

export default function LoadingScreen() {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          {/* Background - matches hero section */}
          <div className="absolute inset-0 bg-black/80" />

          {/* Video background for hero match (optional) */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900" />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="relative z-10 flex flex-col items-center justify-center text-center"
          >
            {/* Animated Logo/Text */}
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-widest"
            >
              LONDON KOLLECTION
            </motion.h2>

            {/* Animated Spinner */}
            <motion.div
              className="relative w-20 h-20 mb-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              {/* Outer ring */}
              <motion.div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white opacity-80" />

              {/* Middle ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-3 border-transparent border-b-white opacity-60"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              {/* Inner dot */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-300 text-lg tracking-widest"
            >
              <span className="inline-block">Loading</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ...
              </motion.span>
            </motion.p>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-gray-400 text-sm mt-6"
            >
              Gift & Novelties | Retail & Wholesale
            </motion.p>

            {/* Animated bottom line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-8 h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent rounded-full"
            />
          </motion.div>

          {/* Animated background elements */}
          <motion.div
            className="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-24 h-24 border border-white/10 rounded-full"
            animate={{ rotate: -360, scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
