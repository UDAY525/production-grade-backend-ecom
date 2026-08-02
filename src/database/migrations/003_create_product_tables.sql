CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================
-- Brands
-- ==========================

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,

    logo_key TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================
-- Categories
-- ==========================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_parent
ON categories(parent_id);

-- ==========================
-- Products
-- ==========================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    seller_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    brand_id UUID
        REFERENCES brands(id)
        ON DELETE SET NULL,

    name VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL UNIQUE,

    description TEXT,

    hero_image_key TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'archived')),

    created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    updated_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_seller
ON products(seller_id);

CREATE INDEX idx_products_brand
ON products(brand_id);

CREATE INDEX idx_products_slug
ON products(slug);

CREATE INDEX idx_products_status
ON products(status);

-- ==========================
-- Product Categories
-- ==========================

CREATE TABLE product_categories (
    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    category_id UUID NOT NULL
        REFERENCES categories(id)
        ON DELETE CASCADE,

    PRIMARY KEY(product_id, category_id)
);

-- ==========================
-- Product Variants
-- ==========================

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    sku VARCHAR(100) NOT NULL UNIQUE,

    title VARCHAR(255) NOT NULL,

    price NUMERIC(12,2) NOT NULL
        CHECK(price >= 0),

    compare_price NUMERIC(12,2)
        CHECK(compare_price IS NULL OR compare_price >= price),

    weight NUMERIC(10,2),

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product
ON product_variants(product_id);

CREATE INDEX idx_variants_sku
ON product_variants(sku);

-- ==========================
-- Inventory
-- ==========================

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    variant_id UUID NOT NULL UNIQUE
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    available_quantity INT NOT NULL DEFAULT 0
        CHECK(available_quantity >= 0),

    reserved_quantity INT NOT NULL DEFAULT 0
        CHECK(reserved_quantity >= 0),

    low_stock_threshold INT NOT NULL DEFAULT 5
        CHECK(low_stock_threshold >= 0),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================
-- Product Images
-- ==========================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    variant_id UUID
        REFERENCES product_variants(id)
        ON DELETE CASCADE,

    object_key TEXT NOT NULL,

    alt_text TEXT,

    sort_order INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product
ON product_images(product_id);

CREATE INDEX idx_product_images_variant
ON product_images(variant_id);