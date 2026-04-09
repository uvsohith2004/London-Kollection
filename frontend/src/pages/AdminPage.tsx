import { useEffect, useState, useRef } from "react";
import { Edit, Trash2, Plus, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProductStore, Product } from "@/store/productStore";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  "Jewellery",
  "Earrings",
  "Necklace",
  "Cuff bracelet",
  "Finger ring",
  "Long necklace",
  "Bead necklace",
  "Anklets",
  "Bracelets",
  "Hair accessories",
  "Crown",
  "Studs",
  "Piercing",
  "Bangles",
  "Watches",
  "Kids jewellery",
  "Heritage collection",
  "Hip Belts",
  "Belly piercing",
  "Sunglasses",
  "Bags",
  "Kids bags",
  "Mehandi",
  "Tattoo",
  "Bridal jewellery set",
  "24k plated jewelry",
  "Choker necklace",
  "Perfumes",
  "Body lotion",
  "Body scrub",
  "Promotion",
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    title: "",
    slug: "",
    description: "",
    price: "",
    category: "",
    images: [],
    stock: "",
    isFeatured: false,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchProducts();
  }, [isAuthenticated, user]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageSelect = (e: any) => {
    const files = Array.from(e.target.files);

    const imagePreviews = files.map((file: any) =>
      URL.createObjectURL(file)
    );

    setForm({
      ...form,
      images: [...form.images, ...imagePreviews],
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      description: "",
      price: "",
      category: "",
      images: [],
      stock: "",
      isFeatured: false,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.title || !form.category || !form.price || !form.stock) {
      toast.error("Fill required fields");
      return;
    }

    const submitData = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      currency: "KWD",
    };

    try {
      if (editingId) {
        await updateProduct(editingId, submitData);
        toast.success("Product updated");
      } else {
        await createProduct(submitData);
        toast.success("Product created");
      }
      resetForm();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      images: p.images,
      stock: p.stock,
      isFeatured: p.isFeatured,
    });
    setEditingId(p._id || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen px-10 py-20">

      {/* HEADER */}
      <div className="mb-14">
        <h1 className="text-4xl font-display">
          Admin Product Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Full inventory control system
        </p>
      </div>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-border rounded-3xl p-10 mb-20"
      >
        <h2 className="text-xl font-display mb-8 flex items-center gap-2">
          <Plus size={18} />
          {editingId ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid md:grid-cols-2 gap-6">

            <input
              name="title"
              placeholder="Product Title *"
              value={form.title}
              onChange={handleChange}
              className="border border-border rounded-xl px-4 py-3"
            />

            <input
              name="slug"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={handleChange}
              className="border border-border rounded-xl px-4 py-3"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border border-border rounded-xl px-4 py-3"
            >
              <option value="">Select Category *</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              name="price"
              placeholder="Price (KWD) *"
              value={form.price}
              onChange={handleChange}
              className="border border-border rounded-xl px-4 py-3"
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock *"
              value={form.stock}
              onChange={handleChange}
              className="border border-border rounded-xl px-4 py-3"
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="w-full border border-border rounded-xl px-4 py-3"
          />

          {/* IMAGE SECTION (UPDATED) */}
          <div className="space-y-4">

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 bg-black text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider hover:bg-charcoal transition shadow-md"
            >
              <Upload size={16} />
              Add Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex gap-4 flex-wrap">
              {form.images.map((img: string, i: number) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    className="w-24 h-24 object-cover rounded-xl border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        images: form.images.filter((_: any, idx: number) => idx !== i),
                      })
                    }
                    className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* DISPLAY SETTINGS */}
          <div className="border-t border-border pt-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
              />
              <span className="text-sm">
                Mark as Featured Product
              </span>
            </label>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              className="bg-foreground text-background px-10 py-3 rounded-full text-sm uppercase"
            >
              {editingId ? "Update Product" : "Create Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-border px-8 py-3 rounded-full text-sm"
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </motion.div>

      {/* PRODUCT TABLE (UNCHANGED) */}
      <div>
        <h2 className="text-2xl font-display mb-6">
          Products ({products.length})
        </h2>

        <div className="border border-border rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Stock</th>
                <th className="px-6 py-4 text-center">Featured</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: Product) => (
                <tr key={p._id} className="border-t border-border">
                  <td className="px-6 py-4 flex items-center gap-4">
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    )}
                    {p.title}
                  </td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4 text-right">
                    {p.price} KWD
                  </td>
                  <td className="px-6 py-4 text-right">{p.stock}</td>
                  <td className="px-6 py-4 text-center">
                    {p.isFeatured ? "✓" : "—"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-6">
                      <button onClick={() => handleEdit(p)}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteProduct(p._id || "")}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}