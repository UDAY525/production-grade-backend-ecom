import { z } from "zod";

const imageSchema = z.object({
  objectKey: z.string().min(1),
  altText: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const inventorySchema = z.object({
  availableQuantity: z.number().int().min(0),
  reservedQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
});

const variantSchema = z.object({
  sku: z.string().min(1),

  title: z.string().min(1),

  price: z.number().positive(),

  comparePrice: z.number().positive().optional(),

  weight: z.number().positive().optional(),

  isDefault: z.boolean().optional(),

  inventory: inventorySchema,

  images: z.array(imageSchema).min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(2),

  slug: z.string().min(2),

  description: z.string().optional(),

  brandId: z.string().uuid().optional(),

  categoryIds: z.array(z.string().uuid()).min(1),

  variants: z.array(variantSchema).min(1),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(100).default(20),

  search: z.string().optional(),

  brandId: z.string().uuid().optional(),

  categoryId: z.string().uuid().optional(),

  sellerId: z.string().uuid().optional(),

  status: z.enum(["draft", "active", "archived"]).optional(),

  sort: z
    .enum(["newest", "oldest", "price_asc", "price_desc"])
    .default("newest"),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),

  slug: z.string().min(2).optional(),

  description: z.string().optional(),

  brandId: z.string().uuid().nullable().optional(),

  status: z.enum(["draft", "active", "archived"]).optional(),

  categoryIds: z.array(z.string().uuid()).optional(),
});
