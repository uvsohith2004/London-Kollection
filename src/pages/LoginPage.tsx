import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(formData);

    if (result.success) {
      toast.success("Welcome back");
      navigate("/");
    } else {
      toast.error(result.error || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1400"
          alt="Luxury lifestyle"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />

        <div className="absolute inset-0 flex flex-col justify-center px-20 text-white">
          <h2 className="mb-6 text-6xl font-semibold leading-tight">Welcome back.</h2>
          <p className="mb-8 text-lg text-gray-200">Continue your journey with curated luxury.</p>
          <div className="space-y-4 text-sm text-gray-300">
            <p>Premium collections</p>
            <p>Secure checkout</p>
            <p>Exclusive member access</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-gray-100 px-6 py-16 pt-40">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl bg-white p-12 shadow-2xl"
        >
          <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">London Collection</p>
          <h1 className="mb-2 text-3xl font-semibold">Sign in to your account</h1>
          <p className="mb-8 text-sm text-gray-500">Access your profile, wishlist and premium products.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 text-sm focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">Password</label>
                <Link to="/forgot-password" className="text-xs text-black underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-10 text-sm focus:border-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-black underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
