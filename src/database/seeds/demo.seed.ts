import type { PoolClient } from "pg";

export async function seedDemo(client: PoolClient) {
  // -------------------------
  // Admin
  // -------------------------

  const {
    rows: [admin],
  } = await client.query<{
    id: string;
  }>(
    `
    SELECT id
    FROM users
    WHERE email = 'admin@test.com'
    `,
  );

  // -------------------------
  // Seller
  // -------------------------

  const {
    rows: [seller],
  } = await client.query<{
    id: string;
  }>(
    `
    SELECT id
    FROM users
    WHERE email = 'seller@test.com'
    `,
  );

  // -------------------------
  // Brand
  // -------------------------

  const {
    rows: [brand],
  } = await client.query<{
    id: string;
  }>(
    `
    INSERT INTO brands
    (
      name,
      slug,
      logo_key
    )
    VALUES
    (
      'Apple',
      'apple',
      'brands/apple/logo.png'
    )
    ON CONFLICT(slug)
    DO UPDATE SET
      name = EXCLUDED.name
    RETURNING id
    `,
  );

  // -------------------------
  // Parent Category
  // -------------------------

  const {
    rows: [mobiles],
  } = await client.query<{
    id: string;
  }>(
    `
    INSERT INTO categories
    (
      name,
      slug
    )
    VALUES
    (
      'Mobiles',
      'mobiles'
    )
    ON CONFLICT(slug)
    DO UPDATE SET
      name = EXCLUDED.name
    RETURNING id
    `,
  );

  // -------------------------
  // Child Category
  // -------------------------

  const {
    rows: [iphone],
  } = await client.query<{
    id: string;
  }>(
    `
    INSERT INTO categories
    (
      parent_id,
      name,
      slug
    )
    VALUES
    (
      $1,
      'iPhone',
      'iphone'
    )
    ON CONFLICT(slug)
    DO UPDATE SET
      parent_id = EXCLUDED.parent_id
    RETURNING id
    `,
    [mobiles.id],
  );

  // -------------------------
  // Product
  // -------------------------

  const {
    rows: [product],
  } = await client.query<{
    id: string;
  }>(
    `
    INSERT INTO products
    (
      seller_id,
      brand_id,
      name,
      slug,
      description,
      status,
      created_by,
      updated_by
    )
    VALUES
    (
      $1,
      $2,
      'iPhone 16',
      'iphone-16',
      'Latest Apple flagship',
      'active',
      $3,
      $3
    )
    ON CONFLICT(slug)
    DO UPDATE SET
      name = EXCLUDED.name
    RETURNING id
    `,
    [seller.id, brand.id, admin.id],
  );

  // -------------------------
  // Product Category
  // -------------------------

  await client.query(
    `
    INSERT INTO product_categories
    (
      product_id,
      category_id
    )
    VALUES
    (
      $1,
      $2
    )
    ON CONFLICT DO NOTHING
    `,
    [product.id, iphone.id],
  );

  // -------------------------
  // Variant
  // -------------------------

  const {
    rows: [variant],
  } = await client.query<{
    id: string;
  }>(
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
    VALUES
    (
      $1,
      'IPH16-BLK-128',
      'Black / 128GB',
      79999,
      84999,
      0.18,
      true
    )
    ON CONFLICT(sku)
    DO UPDATE SET
      title = EXCLUDED.title
    RETURNING id
    `,
    [product.id],
  );

  // -------------------------
  // Inventory
  // -------------------------

  await client.query(
    `
    INSERT INTO inventory
    (
      variant_id,
      available_quantity,
      reserved_quantity,
      low_stock_threshold
    )
    VALUES
    (
      $1,
      100,
      0,
      5
    )
    ON CONFLICT(variant_id)
    DO NOTHING
    `,
    [variant.id],
  );

  // -------------------------
  // Images
  // -------------------------

  await client.query(
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
    ($1,$2,'products/iphone16/front.webp','Front',0),
    ($1,$2,'products/iphone16/back.webp','Back',1)
    `,
    [product.id, variant.id],
  );

  console.log("✅ Demo data seeded");
}
