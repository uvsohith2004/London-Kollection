import Product from "../models/Product.js";

/**
 * GET ALL PRODUCTS
 * Public endpoint - returns only active products
 * Supports filtering and pagination
 */
export const getProducts = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CONTROLLER] getProducts called');
    
    const { category, featured, skip = 0, limit = 100 } = req.query;
    
    const filters = {
      isActive: true, // Only return active products
    };

    if (category) {
      filters.category = category;
    }
    if (featured === 'true') {
      filters.isFeatured = true;
    }

    const { products, total } = await Product.findAll(
      filters,
      parseInt(skip),
      parseInt(limit)
    );

    console.log('[PRODUCT_CONTROLLER] Returning', products.length, 'products');

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        skip: parseInt(skip),
        limit: parseInt(limit),
        hasMore: parseInt(skip) + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in getProducts:', error.message);
    next(error);
  }
};

/**
 * GET FEATURED PRODUCTS
 * Public endpoint
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CONTROLLER] getFeaturedProducts called');
    
    const limit = parseInt(req.query.limit) || 5;
    const products = await Product.getFeatured(limit);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in getFeaturedProducts:', error.message);
    next(error);
  }
};

/**
 * GET SINGLE PRODUCT
 * Public endpoint
 * Can fetch by ID or slug
 */
export const getProductDetail = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CONTROLLER] getProductDetail called for:', req.params.id);
    
    let product = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      product = await Product.findById(req.params.id);
    }

    if (!product) {
      product = await Product.findBySlug(req.params.id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in getProductDetail:', error.message);
    next(error);
  }
};

/**
 * GET CATEGORIES
 * Public endpoint
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in getCategories:', error.message);
    next(error);
  }
};

/**
 * CREATE PRODUCT
 * Admin only endpoint
 * Creates new product with validation
 */
export const createProduct = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CONTROLLER] createProduct called by user:', req.user.id);
    
    const { title, description, price, currency, category, images, stock, isFeatured, slug } = req.body;

    // Validation
    if (!title || !category || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, category, price'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    const productData = {
      title,
      description: description || '',
      price: parseFloat(price),
      currency: currency || 'KWD',
      category,
      images: Array.isArray(images) ? images : [],
      stock: parseInt(stock) || 0,
      isFeatured: isFeatured === true || isFeatured === 'true',
      isActive: true,
      createdBy: req.user.id
    };

    if (slug) {
      productData.slug = slug;
    }

    const product = await Product.create(productData);

    console.log('[PRODUCT_CONTROLLER] Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in createProduct:', error.message);
    
    if (error.code === 'DUPLICATE_FIELD') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

/**
 * UPDATE PRODUCT
 * Admin only endpoint
 */
export const updateProduct = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CONTROLLER] updateProduct called for:', req.params.id);
    
    // Don't allow changing createdBy
    const updateData = { ...req.body };
    delete updateData.createdBy;
    delete updateData._id;

    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    const product = await Product.update(req.params.id, updateData);

    console.log('[PRODUCT_CONTROLLER] Product updated:', req.params.id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in updateProduct:', error.message);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    next(error);
  }
};

/**
 * DELETE PRODUCT
 * Admin only endpoint
 */
export const deleteProduct = async (req, res, next) => {
  try {
    console.log('[PRODUCT_CONTROLLER] deleteProduct called for:', req.params.id);
    
    await Product.delete(req.params.id);

    console.log('[PRODUCT_CONTROLLER] Product deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('[PRODUCT_CONTROLLER] Error in deleteProduct:', error.message);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    next(error);
  }
};
