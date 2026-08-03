export interface ProductImageDto {
  objectKey: string;
  altText?: string | undefined;
  sortOrder?: number | undefined;
}

export interface InventoryDto {
  availableQuantity: number;
  reservedQuantity?: number | undefined;
  lowStockThreshold?: number | undefined;
}

export interface ProductVariantDto {
  sku: string;
  title: string;

  price: number;
  comparePrice?: number | undefined;

  weight?: number | undefined;

  isDefault?: boolean | undefined;

  inventory: InventoryDto;

  images: ProductImageDto[];
}

export interface CreateProductDto {
  name: string;
  slug: string;

  description?: string | undefined;

  brandId?: string | undefined;

  categoryIds: string[];

  variants: ProductVariantDto[];
}

export interface GetProductsQuery {
  page?: number | undefined;
  limit?: number | undefined;

  search?: string | undefined;

  brandId?: string | undefined;
  categoryId?: string | undefined;

  sellerId?: string | undefined;

  status?: "draft" | "active" | "archived" | undefined;

  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | undefined;
}

export interface UpdateProductDto {
  name?: string;
  slug?: string;
  description?: string;
  brandId?: string | null;
  status?: "draft" | "active" | "archived";
  categoryIds?: string[];
}
