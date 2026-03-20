import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const result = await login(formData);

    if (!result.success) {
      toast.error("Invalid credentials");
      return;
    }

    if (result.data.user.role !== "admin") {
      toast.error("Access denied");
      return;
    }

    toast.success("Welcome back");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-20">

      <div className="w-full max-w-md space-y-10">

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-display tracking-widest">
            ADMIN ACCESS
          </h1>
          <p className="text-sm text-white/60">
            Authorized personnel only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-white/50">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-3 rounded-full text-sm uppercase tracking-wider hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Enter Dashboard"}
          </button>

        </form>

      </div>
    </div>
  );
}