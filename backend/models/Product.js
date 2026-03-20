import mongoose from "mongoose";

// ✅ Helper to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const productSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      index: true 
    },
    description: { 
      type: String, 
      default: "" 
    },
    price: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: "KWD" 
    },
    category: { 
      type: String, 
      required: true,
      index: true 
    },
    images: { 
      type: [String], 
      default: [] 
    },
    stock: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    isFeatured: { 
      type: Boolean, 
      default: false 
    },
    isActive: { 
      type: Boolean, 
      default: true,
      index: true 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Create text index for search
productSchema.index({ title: "text", description: "text" });

const ProductModel = mongoose.model("Product", productSchema);

/**
 * Product Model - Handles product data with MongoDB
 */
class Product {
  /**
   * Create a new product
   * @param {Object} data - Product data
   * @returns {Promise<Object>} Created product
   */
  static async create(data) {
    try {
      console.log('[PRODUCT_MODEL] Creating new product:', { title: data.title, slug: data.slug });
      
      // Auto-generate slug if not provided
      if (!data.slug) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }

      const product = await ProductModel.create(data);
      console.log('[PRODUCT_MODEL] Product created successfully:', { id: product._id, slug: product.slug });
      return product.toJSON();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const customError = new Error(`Product with this ${field} already exists`);
        customError.statusCode = 409;
        customError.code = 'DUPLICATE_FIELD';
        throw customError;
      }
      throw error;
    }
  }

  /**
   * Find all products with filtering and pagination
   * @param {Object} filters - { isActive, isFeatured, category }
   * @param {Number} skip
   * @param {Number} limit
   * @returns {Promise<Object>} { products, total }
   */
  static async findAll(filters = {}, skip = 0, limit = 100) {
    try {
      const query = {};
      
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      if (filters.isFeatured) {
        query.isFeatured = true;
      }
      if (filters.category) {
        query.category = filters.category;
      }

      console.log('[PRODUCT_MODEL] Finding products with filters:', filters);

      const products = await ProductModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const total = await ProductModel.countDocuments(query);

      console.log('[PRODUCT_MODEL] Found', total, 'products');
      return { products, total };
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error finding products:', error.message);
      throw error;
    }
  }

  /**
   * Find product by ID
   */
  static async findById(id) {
    try {
      // ✅ CRITICAL: Validate ID format before MongoDB query
      if (!id) {
        console.log('[PRODUCT_MODEL] Product ID is empty');
        return null;
      }

      if (!isValidObjectId(id)) {
        console.error('[PRODUCT_MODEL] Invalid ObjectId format:', id, typeof id);
        throw new Error(`Invalid product ID format: "${id}" is not a valid MongoDB ObjectId. Expected format: 507f1f77bcf86cd799439011`);
      }

      console.log('[PRODUCT_MODEL] Finding product by ID:', id);
      const product = await ProductModel.findById(id).lean();

      if (!product) {
        console.log('[PRODUCT_MODEL] Product not found:', id);
        return null;
      }

      console.log('[PRODUCT_MODEL] Product found:', id);
      return product;
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error finding product:', error.message);
      throw error;
    }
  }

  /**
   * Find product by slug
   */
  static async findBySlug(slug) {
    try {
      const product = await ProductModel.findOne({ slug }).lean();
      return product || null;
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error finding by slug:', error.message);
      throw error;
    }
  }

  /**
   * Update product
   */
  static async update(id, updateData) {
    try {
      console.log('[PRODUCT_MODEL] Updating product:', id);
      
      const product = await ProductModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).lean();

      if (!product) {
        throw new Error('Product not found');
      }

      console.log('[PRODUCT_MODEL] Product updated:', id);
      return product;
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error updating product:', error.message);
      throw error;
    }
  }

  /**
   * Decrement stock after a successful payment verification.
   * Uses an atomic query so stock never goes below zero.
   */
  static async decrementStock(id, quantity) {
    try {
      if (!id) {
        throw new Error('Product ID is required for stock decrement');
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('A valid quantity greater than 0 is required for stock decrement');
      }

      if (!isValidObjectId(id)) {
        throw new Error(`Invalid product ID format: "${id}"`);
      }

      console.log('[PRODUCT_MODEL] Decrementing stock:', { id, quantity });

      const product = await ProductModel.findOneAndUpdate(
        { _id: id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      ).lean();

      if (!product) {
        console.error('[PRODUCT_MODEL] Stock decrement failed. Product missing or insufficient stock:', {
          id,
          quantity,
        });
        return null;
      }

      console.log('[PRODUCT_MODEL] Stock decremented successfully:', {
        id,
        quantity,
        remainingStock: product.stock,
      });

      return product;
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error decrementing stock:', error.message);
      throw error;
    }
  }

  /**
   * Delete product
   */
  static async delete(id) {
    try {
      console.log('[PRODUCT_MODEL] Deleting product:', id);
      
      const product = await ProductModel.findByIdAndDelete(id);

      if (!product) {
        throw new Error('Product not found');
      }

      console.log('[PRODUCT_MODEL] Product deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error deleting product:', error.message);
      throw error;
    }
  }

  /**
   * Get featured products
   */
  static async getFeatured(limit = 5) {
    try {
      const products = await ProductModel.find({
        isFeatured: true,
        isActive: true
      })
        .limit(limit)
        .lean();
      return products;
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error getting featured:', error.message);
      throw error;
    }
  }

  /**
   * Get categories
   */
  static async getCategories() {
    try {
      const categories = await ProductModel.distinct('category', { isActive: true });
      return categories;
    } catch (error) {
      console.error('[PRODUCT_MODEL] Error getting categories:', error.message);
      throw error;
    }
  }
}

export default Product;
