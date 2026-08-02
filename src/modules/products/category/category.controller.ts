import type { Request, Response } from "express";
import { ApiResponse } from "../../../common/response/ApiResponse";
import { createCategorySchema } from "./category.validation";
import { CategoryService } from "./category.service";

const service = new CategoryService();

export class CategoryController {
  async create(req: Request, res: Response) {
    const body = createCategorySchema.parse(req.body);

    const category = await service.create(body);

    res
      .status(201)
      .json(ApiResponse.success(category, "Category created successfully"));
  }

  async getAll(req: Request, res: Response) {
    const categories = await service.getAll();

    res.json(ApiResponse.success(categories));
  }
}
