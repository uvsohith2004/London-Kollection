import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/services/api";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.forgotPassword(form.email);
      toast.success("If your account exists, an OTP has been sent to your email.");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.verifyResetOtp({
        email: form.email,
        otp: form.otp,
      });
      toast.success("OTP verified");
      setStep("reset");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword({
        email: form.email,
        newPassword: form.newPassword,
      });
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-[2rem] border border-stone-200 bg-white p-10 shadow-xl"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone-400">Account Recovery</p>
        <h1 className="mb-3 text-3xl font-semibold text-stone-900">Forgot your password?</h1>
        <p className="mb-8 text-sm text-stone-500">
          We&apos;ll guide you through email verification and let you set a new password securely.
        </p>

        <div className="mb-8 flex gap-2">
          {["email", "otp", "reset"].map((item, index) => {
            const active = step === item;
            const completed = ["email", "otp", "reset"].indexOf(step) > index;

            return (
              <div
                key={item}
                className={`h-2 flex-1 rounded-full ${active || completed ? "bg-black" : "bg-stone-200"}`}
              />
            );
          })}
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-stone-600">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={updateField}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-stone-600">6-digit OTP</label>
              <input
                name="otp"
                inputMode="numeric"
                maxLength={6}
                required
                value={form.otp}
                onChange={updateField}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-center text-lg tracking-[0.5em] focus:border-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-stone-600">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                value={form.newPassword}
                onChange={updateField}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-stone-600">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={updateField}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-stone-500">
          Back to{" "}
          <Link to="/login" className="text-black underline">
            sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
