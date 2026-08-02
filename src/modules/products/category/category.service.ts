import { ConflictError } from "../../../common/errors/ConflictError";
import { NotFoundError } from "../../../common/errors/NotFoundError";
import { CategoryRepository } from "./category.repository";
import type { CreateCategoryDto } from "./category.types";

export class CategoryService {
  constructor(private readonly repo = new CategoryRepository()) {}

  async create(data: CreateCategoryDto) {
    if ((await this.repo.findBySlug(data.slug)).rowCount) {
      throw new ConflictError("Category already exists");
    }

    if (data.parentId) {
      if (!(await this.repo.findById(data.parentId)).rowCount) {
        throw new NotFoundError("Parent category not found");
      }
    }

    return (await this.repo.create(data)).rows[0];
  }

  async getAll() {
    return (await this.repo.findAll()).rows;
  }
}
