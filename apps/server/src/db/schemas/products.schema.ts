import {
  pgTable,
  text,
  varchar,
  uuid,
  timestamp,
  index,
  integer,
  boolean,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"
import { nanoid } from "nanoid"
import { returnForm } from "./return-forms.schema"

import type { OptimizedImageAsset } from "./image.schema"
import { category } from "./categories.schema"
import { collection } from "./collections.schema"
import { occasion } from "./occasions.schema"
import { taxClass } from "./taxes.schema"
import { brand } from "./brands.schema"
import { ProductDimensionsDTO } from "@/modules/catalog/products/product.dto"

export const product = pgTable(
  "product",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => nanoid())
      .primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description"),
    description: text("description"),
    visibility: text("visibility").default("public").notNull(), // "public" | "hidden"
    status: text("status").default("draft").notNull(), // "draft" | "published" | "archived" | "scheduled" | "hidden"

    // Pricing (base — variants override)
    price: numeric("price", { precision: 12, scale: 3 }).notNull(),
    discount: numeric("discount", { precision: 12, scale: 3 })
      .default("0.000")
      .notNull(),
    currency: text("currency").default("KWD").notNull(),

    // Taxonomy
    brandId: uuid("brand_id").references(() => brand.id, {
      onDelete: "set null",
    }),
    productType: text("product_type"),
    categoryId: uuid("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    taxClassId: uuid("tax_class_id").references(() => taxClass.id, {
      onDelete: "set null",
    }),
    returnFormId: uuid("return_form_id").references(() => returnForm.id, {
      onDelete: "set null",
    }),
    returnWindowDays: integer("return_window_days"),
    exchangeWindowDays: integer("exchange_window_days"),

    // Flags
    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    archived: boolean("archived").default(false).notNull(),
    isNewArrival: boolean("is_new_arrival").default(false).notNull(),
    isReturnable: boolean("is_returnable").default(true).notNull(),
    isExchangeable: boolean("is_exchangeable").default(true).notNull(),

    // Aggregates
    averageRating: numeric("average_rating", { precision: 2, scale: 1 })
      .default("0.0")
      .notNull(),
    reviewCount: integer("review_count").default(0).notNull(),

    // SEO
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    seoKeywords: text("seo_keywords").array(),

    // Physical
    dimensions: jsonb("dimensions").$type<ProductDimensionsDTO>(), // { length, width, height, weight, lengthUnit, weightUnit }

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Slug is primarily used for frontend URL lookups
    index("product_slug_idx").on(table.slug),

    // Intelligent Partial Indexes:
    // We only care about indexing products that are actually published for the frontend.
    // This dramatically reduces index size and speeds up inserts/updates for drafts.

    // 1. Browsing categories (most common query): Fetch published products in a category, sorted by creation date
    index("product_category_published_idx")
      .on(table.categoryId, table.createdAt)
      .where(sql`published = true`),

    // 2. Homepage "Featured" section: Fetch published + featured products
    index("product_featured_published_idx")
      .on(table.createdAt)
      .where(sql`published = true AND featured = true`),

    // 3. Homepage "New Arrivals" section: Fetch published + new arrival products
    index("product_new_arrival_published_idx")
      .on(table.createdAt)
      .where(sql`published = true AND is_new_arrival = true`),
  ]
)

// Product Options (e.g. Size, Color)
export const productOption = pgTable(
  "product_option",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => nanoid())
      .primaryKey(),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g. "Size", "Color"
    position: integer("position").default(0).notNull(),
  },
  (table) => [index("product_option_productId_idx").on(table.productId)]
)

// Product Option Values (e.g. XL, Red)
export const productOptionValue = pgTable(
  "product_option_value",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => nanoid())
      .primaryKey(),
    optionId: varchar("option_id", { length: 36 })
      .notNull()
      .references(() => productOption.id, { onDelete: "cascade" }),
    value: text("value").notNull(), // e.g. "XL", "Medium"
  },
  (table) => [index("product_option_value_optionId_idx").on(table.optionId)]
)

// Product Variants (e.g. Size XL + Color Red)
export const productVariant = pgTable(
  "product_variant",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => nanoid())
      .primaryKey(),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    name: text("name"), // Group/Variant label
    sku: text("sku").notNull().unique(),
    isDefault: boolean("is_default").default(false).notNull(),
    price: numeric("price", { precision: 12, scale: 3 }), // overrides base price if set
    discountValue: numeric("discount_value", { precision: 12, scale: 3 })
      .default("0.000")
      .notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 3 }),
    stock: integer("stock").default(0).notNull(),
    reservedStock: integer("reserved_stock").default(0).notNull(),
    combinations: jsonb("combinations")
      .$type<Record<string, string>>()
      .notNull(), // e.g. {"Size": "XL", "Color": "Red"}
    barcode: text("barcode"),
    inventoryStatus: text("inventory_status").default("in_stock").notNull(), // "in_stock" | "out_of_stock" | "pre_order" | "coming_soon"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_variant_productId_idx").on(table.productId),
    index("product_variant_sku_idx").on(table.sku),
  ]
)

export const productImage = pgTable(
  "product_image",
  {
    id: varchar("id", { length: 36 })
      .$defaultFn(() => nanoid())
      .primaryKey(),
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    variantId: varchar("variant_id", { length: 36 }).references(
      () => productVariant.id,
      { onDelete: "set null" }
    ),
    asset: jsonb("key").$type<OptimizedImageAsset>().notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_image_productId_idx").on(table.productId),
    index("product_image_variantId_idx").on(table.variantId),
  ]
)

export const productCategory = pgTable(
  "product_category",
  {
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("product_category_productId_idx").on(table.productId),
    index("product_category_categoryId_idx").on(table.categoryId),
  ]
)

export const productCollection = pgTable(
  "product_collection",
  {
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("product_collection_productId_idx").on(table.productId),
    index("product_collection_collectionId_idx").on(table.collectionId),
  ]
)

export const productOccasion = pgTable(
  "product_occasion",
  {
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    occasionId: uuid("occasion_id")
      .notNull()
      .references(() => occasion.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("product_occasion_productId_idx").on(table.productId),
    index("product_occasion_occasionId_idx").on(table.occasionId),
  ]
)

// Relations
export const productRelations = relations(product, ({ one, many }) => ({
  brand: one(brand, {
    fields: [product.brandId],
    references: [brand.id],
  }),
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  taxClass: one(taxClass, {
    fields: [product.taxClassId],
    references: [taxClass.id],
  }),

  returnForm: one(returnForm, {
    fields: [product.returnFormId],
    references: [returnForm.id],
  }),
  images: many(productImage),
  categories: many(productCategory),
  collections: many(productCollection),
  occasions: many(productOccasion),
  options: many(productOption),
  variants: many(productVariant),
}))

export const productOptionRelations = relations(
  productOption,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productOption.productId],
      references: [product.id],
    }),
    values: many(productOptionValue),
  })
)

export const productOptionValueRelations = relations(
  productOptionValue,
  ({ one }) => ({
    option: one(productOption, {
      fields: [productOptionValue.optionId],
      references: [productOption.id],
    }),
  })
)

export const productVariantRelations = relations(
  productVariant,
  ({ one, many }) => ({
    product: one(product, {
      fields: [productVariant.productId],
      references: [product.id],
    }),
    images: many(productImage),
  })
)

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
  variant: one(productVariant, {
    fields: [productImage.variantId],
    references: [productVariant.id],
  }),
}))

export const productCategoryRelations = relations(
  productCategory,
  ({ one }) => ({
    product: one(product, {
      fields: [productCategory.productId],
      references: [product.id],
    }),
    category: one(category, {
      fields: [productCategory.categoryId],
      references: [category.id],
    }),
  })
)

export const productCollectionRelations = relations(
  productCollection,
  ({ one }) => ({
    product: one(product, {
      fields: [productCollection.productId],
      references: [product.id],
    }),
    collection: one(collection, {
      fields: [productCollection.collectionId],
      references: [collection.id],
    }),
  })
)

export const productOccasionRelations = relations(
  productOccasion,
  ({ one }) => ({
    product: one(product, {
      fields: [productOccasion.productId],
      references: [product.id],
    }),
    occasion: one(occasion, {
      fields: [productOccasion.occasionId],
      references: [occasion.id],
    }),
  })
)
