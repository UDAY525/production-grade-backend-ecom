import { BaseRepository } from "../../../common/repositories/BaseRepository";
import type { CreateBrandDto } from "./brand.types";

export class BrandRepository extends BaseRepository {
  findBySlug(slug: string) {
    return this.query(`SELECT id FROM brands WHERE slug = $1`, [slug]);
  }

  create(data: CreateBrandDto) {
    return this.query(
      `INSERT INTO brands
      (name, slug, logo_key)
      VALUES ($1,$2,$3)
      RETURNING *`,
      [data.name, data.slug, data.logoKey ?? null],
    );
  }

  findAll() {
    return this.query(`
      SELECT *
      FROM brands
      ORDER BY name
    `);
  }
}
