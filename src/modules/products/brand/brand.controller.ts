import type { Request, Response } from "express";
import { ApiResponse } from "../../../common/response/ApiResponse";
import { createBrandSchema } from "./brand.validation";
import { BrandService } from "./brand.service";

const service = new BrandService();

export class BrandController {
  async create(req: Request, res: Response) {
    const body = createBrandSchema.parse(req.body);

    const brand = await service.create(body);

    res
      .status(201)
      .json(ApiResponse.success(brand, "Brand created successfully"));
  }

  async getAll(req: Request, res: Response) {
    const brands = await service.getAll();

    res.json(ApiResponse.success(brands));
  }
}
