import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function ProfilePage() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "Kuwait",
    postalCode: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        const user = res.data.user;

        setFormData({
          name: user.name || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          country: user.country || "Kuwait",
          postalCode: user.postalCode || "",
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <h1 className="mb-3 font-display text-4xl">My Account</h1>
        <p className="text-sm text-muted-foreground">Manage your shipping details and account preferences.</p>
      </motion.div>

      <div className="grid gap-16 lg:grid-cols-3">
        <div>
          <div className="sticky top-28 rounded-2xl border border-border p-6">
            <h2 className="mb-6 font-display text-lg">Account</h2>

            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/profile"
                  className={`block transition ${
                    location.pathname === "/profile"
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/my-orders"
                  className={`block transition ${
                    location.pathname === "/my-orders"
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border p-12 shadow-sm">
            <h2 className="mb-10 font-display text-2xl">Shipping Information</h2>

            <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm transition focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <PhoneInput
                  country={"kw"}
                  value={formData.phone}
                  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                  containerClass="!w-full"
                  inputClass="!w-full !h-[46px] !text-sm !pl-14 !border !border-border !rounded-lg"
                  buttonClass="!border-border"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm transition focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Postal Code</label>
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm transition focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm transition focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Full Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm transition focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-12">
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-full bg-black px-10 py-3 text-sm uppercase tracking-wider text-white transition hover:bg-charcoal disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
