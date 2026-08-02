import { BaseRepository } from "../../../common/repositories/BaseRepository";
import type { CreateCategoryDto } from "./category.types";

export class CategoryRepository extends BaseRepository {
  findBySlug(slug: string) {
    return this.query(`SELECT id FROM categories WHERE slug = $1`, [slug]);
  }

  findById(id: string) {
    return this.query(`SELECT id FROM categories WHERE id = $1`, [id]);
  }

  create(data: CreateCategoryDto) {
    return this.query(
      `INSERT INTO categories
      (name, slug, parent_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [data.name, data.slug, data.parentId ?? null],
    );
  }

  findAll() {
    return this.query(`
      SELECT *
      FROM categories
      ORDER BY name
    `);
  }
}
