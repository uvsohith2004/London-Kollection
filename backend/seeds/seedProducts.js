/**
 * Seed Script - Populate MongoDB with Products
 *
 * Senior Backend Pattern:
 * - Never rely on static data for production
 * - Seed scripts are one-time initialization tools
 * - Can be run manually or as part of deployment
 *
 * Usage:
 * node backend/seeds/seedProducts.js
 *
 * OR add to package.json:
 * "seed": "node backend/seeds/seedProducts.js"
 * Then run: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/landon_ecommerce';

/**
 * All products that were in static products.ts
 * Now being seeded into MongoDB
 */
const SEED_PRODUCTS = [
  {
    title: "Gold Pattern Bangles Set",
    slug: "gold-pattern-bangles-set",
    description: "Premium 18K gold plated bangles set with intricate floral patterns. Perfect for weddings and special occasions.",
    price: 3.0,
    currency: "KWD",
    category: "Bangles",
    images: [
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop"
    ],
    stock: 25,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Crystal Drop Necklace",
    slug: "crystal-drop-necklace",
    description: "Elegant crystal drop necklace with adjustable chain. Stunning centerpiece for any outfit.",
    price: 4.5,
    currency: "KWD",
    category: "Necklaces",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop"],
    stock: 18,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Pearl Stud Earrings",
    slug: "pearl-stud-earrings",
    description: "Classic pearl stud earrings with gold-plated setting. Timeless elegance for everyday wear.",
    price: 2.0,
    currency: "KWD",
    category: "Earrings",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop"],
    stock: 40,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Rose Gold Watch",
    slug: "rose-gold-watch",
    description: "Minimalist rose gold watch with mesh bracelet. Water-resistant and scratch-proof crystal.",
    price: 8.0,
    currency: "KWD",
    category: "Watches",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop"],
    stock: 12,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Quilted Leather Handbag",
    slug: "quilted-leather-handbag",
    description: "Luxurious quilted leather handbag with gold chain strap. Spacious interior with multiple compartments.",
    price: 12.0,
    currency: "KWD",
    category: "Handbags",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"],
    stock: 8,
    isFeatured: true,
    isActive: true,
  },
  {
    title: "Diamond Cut Bangles",
    slug: "diamond-cut-bangles",
    description: "Set of 6 diamond-cut gold bangles with rhodium finish for extra shine.",
    price: 5.0,
    currency: "KWD",
    category: "Bangles",
    images: ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop"],
    stock: 15,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Layered Chain Necklace",
    slug: "layered-chain-necklace",
    description: "Trendy multi-layered gold chain necklace with pendant charms.",
    price: 3.5,
    currency: "KWD",
    category: "Necklaces",
    images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&h=600&fit=crop"],
    stock: 22,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Hoop Earrings Gold",
    slug: "hoop-earrings-gold",
    description: "Classic gold hoop earrings, lightweight and comfortable for all-day wear.",
    price: 1.5,
    currency: "KWD",
    category: "Earrings",
    images: ["https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&h=600&fit=crop"],
    stock: 50,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Classic Silver Watch",
    slug: "classic-silver-watch",
    description: "Timeless silver-tone analog watch with date display.",
    price: 6.5,
    currency: "KWD",
    category: "Watches",
    images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop"],
    stock: 10,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Mini Crossbody Bag",
    slug: "mini-crossbody-bag",
    description: "Compact crossbody bag in faux leather with adjustable strap.",
    price: 7.0,
    currency: "KWD",
    category: "Handbags",
    images: ["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop"],
    stock: 14,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Twisted Gold Bangle",
    slug: "twisted-gold-bangle",
    description: "Elegant twisted design gold bangle, stackable with other bangles.",
    price: 2.5,
    currency: "KWD",
    category: "Bangles",
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop"],
    stock: 30,
    isFeatured: false,
    isActive: true,
  },
  {
    title: "Statement Choker",
    slug: "statement-choker",
    description: "Bold statement choker necklace with crystal embellishments.",
    price: 5.5,
    currency: "KWD",
    category: "Necklaces",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop"],
    stock: 0,
    isFeatured: false,
    isActive: true,
  },
];

async function seedProducts() {
  try {
    console.log('[SEED] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] ✅ Connected to MongoDB successfully');

    console.log('[SEED] Checking existing products...');
    const existingCount = await Product.countDocuments();
    console.log(`[SEED] Found ${existingCount} existing products`);

    if (existingCount > 0) {
      console.log('[SEED] ⚠️  Products already exist in database');
      console.log('[SEED] Clearing existing products...');
      const deleteResult = await Product.deleteMany({});
      console.log(`[SEED] ✅ Deleted ${deleteResult.deletedCount} products`);
    }

    console.log(`[SEED] Seeding ${SEED_PRODUCTS.length} products...`);
    const insertedProducts = await Product.insertMany(SEED_PRODUCTS);
    console.log(`[SEED] ✅ Successfully seeded ${insertedProducts.length} products`);

    // Log sample product with its generated ObjectId
    console.log('\n[SEED] Sample Product (with real MongoDB ObjectId):');
    console.log(JSON.stringify({
      _id: insertedProducts[0]._id,
      title: insertedProducts[0].title,
      price: insertedProducts[0].price,
      stock: insertedProducts[0].stock,
    }, null, 2));

    console.log('\n[SEED] ✅ Seed completed successfully!');
    console.log('[SEED] You can now:');
    console.log('       1. Start your app');
    console.log('       2. Products will be fetched from MongoDB');
    console.log('       3. All IDs are real ObjectIds from database');

    process.exit(0);
  } catch (error) {
    console.error('[SEED] ❌ Error seeding products:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seed script
seedProducts();
