import type { PoolClient } from "pg";
import { BaseRepository } from "../../../common/repositories/BaseRepository";
import type {
  CreateProductDto,
  GetProductsQuery,
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

  async getAll(query: GetProductsQuery) {
    const conditions: string[] = [];
    const values: unknown[] = [];

    let categoryJoin = "";

    if (query.search) {
      values.push(`%${query.search}%`);

      conditions.push(
        `(p.name ILIKE $${values.length}
        OR p.description ILIKE $${values.length})`,
      );
    }

    if (query.brandId) {
      values.push(query.brandId);

      conditions.push(`p.brand_id = $${values.length}`);
    }

    if (query.sellerId) {
      values.push(query.sellerId);

      conditions.push(`p.seller_id = $${values.length}`);
    }

    if (query.status) {
      values.push(query.status);

      conditions.push(`p.status = $${values.length}`);
    }

    if (query.categoryId) {
      categoryJoin = `
      INNER JOIN product_categories pc
        ON pc.product_id = p.id
    `;

      values.push(query.categoryId);

      conditions.push(`pc.category_id = $${values.length}`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortMap = {
      newest: "p.created_at DESC",
      oldest: "p.created_at ASC",
      price_asc: "v.price ASC",
      price_desc: "v.price DESC",
    };

    values.push(query.limit);
    const limitIndex = values.length;

    values.push((query.page! - 1) * query.limit!);
    const offsetIndex = values.length;

    return this.query(
      `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.status,
      p.created_at,

      b.id   AS brand_id,
      b.name AS brand_name,

      v.id    AS variant_id,
      v.price,

      img.object_key

    FROM products p

    LEFT JOIN brands b
      ON b.id = p.brand_id

    LEFT JOIN product_variants v
      ON v.product_id = p.id
     AND v.is_default = true

    LEFT JOIN product_images img
      ON img.variant_id = v.id
     AND img.sort_order = 0

    ${categoryJoin}

    ${where}

    ORDER BY ${sortMap[query.sort!]}

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
    `,
      values,
    );
  }

  async findById(productId: string) {
    return this.query(
      `
    SELECT
      p.id,
      p.name,
      p.slug,
      p.description,
      p.status,

      b.id   AS brand_id,
      b.name AS brand_name,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'slug', c.slug
            )
          )
          FROM product_categories pc
          JOIN categories c
            ON c.id = pc.category_id
          WHERE pc.product_id = p.id
        ),
        '[]'
      ) AS categories,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', v.id,
              'sku', v.sku,
              'title', v.title,
              'price', v.price,
              'comparePrice', v.compare_price,
              'weight', v.weight,
              'isDefault', v.is_default,

              'inventory',
              (
                SELECT row_to_json(i)
                FROM inventory i
                WHERE i.variant_id = v.id
              ),

              'images',
              (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'id', pi.id,
                      'objectKey', pi.object_key,
                      'altText', pi.alt_text,
                      'sortOrder', pi.sort_order
                    )
                    ORDER BY pi.sort_order
                  ),
                  '[]'
                )
                FROM product_images pi
                WHERE pi.variant_id = v.id
              )
            )
            ORDER BY v.is_default DESC
          )
          FROM product_variants v
          WHERE v.product_id = p.id
        ),
        '[]'
      ) AS variants

    FROM products p

    LEFT JOIN brands b
      ON b.id = p.brand_id

    WHERE p.id = $1
    `,
      [productId],
    );
  }
}
