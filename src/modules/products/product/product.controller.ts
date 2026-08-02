import type { Request, Response } from "express";

import { ApiResponse } from "../../../common/response/ApiResponse";

import { ProductService } from "./product.service";
import { createProductSchema } from "./product.validation";

const service = new ProductService();

export class ProductController {
  async create(req: Request, res: Response) {
    const body = createProductSchema.parse(req.body);

    const product = await service.create(req.user!, body);

    res
      .status(201)
      .json(ApiResponse.success(product, "Product created successfully"));
  }
}
