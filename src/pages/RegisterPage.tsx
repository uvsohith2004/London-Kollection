import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const { confirmPassword, ...data } = formData;
    const result = await register(data);

    if (result.success) {
      toast.success("Welcome to London Collection");
      navigate("/");
    } else {
      toast.error(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* LEFT SIDE – LUXURY IMAGE + BRAND MESSAGE */}
      <div className="hidden md:block relative">

        <img
          src="https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1400"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/65" />

        <div className="absolute inset-0 flex flex-col justify-center px-20 text-white">
          <h2 className="text-6xl leading-tight mb-6 font-semibold">
            Trusted globally since 2009.
          </h2>

          <p className="text-lg mb-8 text-gray-200">
            Not mass produced. Precisely chosen.
          </p>

          <div className="space-y-4 text-sm text-gray-300">
            <p>✓ Curated premium collections</p>
            <p>✓ Secure checkout experience</p>
            <p>✓ Dedicated WhatsApp support</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – FORM */}
      <div className="flex items-center justify-center bg-gray-100 px-6 py-16 pt-20">

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-12 rounded-3xl shadow-2xl"
        >

          <p className="text-xs tracking-widest uppercase text-gray-400 mb-4">
            London Collection
          </p>

          <h1 className="text-3xl mb-2 font-semibold">
            Create your account
          </h1>

          <p className="text-gray-500 text-sm mb-8">
            Join thousands of customers shopping premium collections.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-10 py-3 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-10 py-3 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Minimum 8 characters. Include uppercase,
                lowercase, number and special character.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-600">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-black underline">
              Sign in
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}