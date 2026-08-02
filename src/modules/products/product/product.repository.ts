import type { PoolClient } from "pg";
import { BaseRepository } from "../../../common/repositories/BaseRepository";
import type {
  CreateProductDto,
  InventoryDto,
  ProductImageDto,
  ProductVariantDto,
} from "./product.types";

export class ProductRepository extends BaseRepository {
  constructor(client?: PoolClient) {
    super(client);
  }

  createProduct(sellerId: string, data: CreateProductDto, createdBy: string) {
    return this.query<{ id: string }>(
      `
      INSERT INTO products
      (
        seller_id,
        brand_id,
        name,
        slug,
        description,
        created_by,
        updated_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$6)
      RETURNING id
      `,
      [
        sellerId,
        data.brandId ?? null,
        data.name,
        data.slug,
        data.description ?? null,
        createdBy,
      ],
    );
  }

  addCategories(productId: string, categoryIds: string[]) {
    const values: unknown[] = [];

    const placeholders = categoryIds.map((id, index) => {
      values.push(productId, id);

      return `($${index * 2 + 1}, $${index * 2 + 2})`;
    });

    return this.query(
      `
      INSERT INTO product_categories
      (product_id, category_id)
      VALUES ${placeholders.join(",")}
      `,
      values,
    );
  }

  createVariant(productId: string, variant: ProductVariantDto) {
    return this.query<{ id: string }>(
      `
      INSERT INTO product_variants
      (
        product_id,
        sku,
        title,
        price,
        compare_price,
        weight,
        is_default
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id
      `,
      [
        productId,
        variant.sku,
        variant.title,
        variant.price,
        variant.comparePrice ?? null,
        variant.weight ?? null,
        variant.isDefault ?? false,
      ],
    );
  }

  createInventory(variantId: string, inventory: InventoryDto) {
    return this.query(
      `
      INSERT INTO inventory
      (
        variant_id,
        available_quantity,
        reserved_quantity,
        low_stock_threshold
      )
      VALUES ($1,$2,$3,$4)
      `,
      [
        variantId,
        inventory.availableQuantity,
        inventory.reservedQuantity ?? 0,
        inventory.lowStockThreshold ?? 5,
      ],
    );
  }

  createImages(
    productId: string,
    variantId: string,
    images: ProductImageDto[],
  ) {
    const values: unknown[] = [];

    const placeholders = images.map((image, index) => {
      const start = index * 5;

      values.push(
        productId,
        variantId,
        image.objectKey,
        image.altText ?? null,
        image.sortOrder ?? index,
      );

      return `($${start + 1},$${start + 2},$${start + 3},$${start + 4},$${start + 5})`;
    });

    return this.query(
      `
      INSERT INTO product_images
      (
        product_id,
        variant_id,
        object_key,
        alt_text,
        sort_order
      )
      VALUES
      ${placeholders.join(",")}
      `,
      values,
    );
  }
}
