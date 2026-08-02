import { ConflictError } from "../../../common/errors/ConflictError";
import { BrandRepository } from "./brand.repository";
import type { CreateBrandDto } from "./brand.types";

export class BrandService {
  constructor(private readonly repo = new BrandRepository()) {}

  async create(data: CreateBrandDto) {
    const exists = await this.repo.findBySlug(data.slug);

    if (exists.rowCount) {
      throw new ConflictError("Brand already exists");
    }

    const { rows } = await this.repo.create(data);

    return rows[0];
  }

  async getAll() {
    const { rows } = await this.repo.findAll();

    return rows;
  }
}
