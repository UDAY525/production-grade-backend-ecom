import type { Request, Response } from "express";

import { ApiResponse } from "../../../common/response/ApiResponse";

import { ProductService } from "./product.service";
import {
  createProductSchema,
  getProductsSchema,
  updateProductSchema,
} from "./product.validation";
import { AppError } from "../../../common/errors/AppError";

const service = new ProductService();

export class ProductController {
  async create(req: Request, res: Response) {
    const body = createProductSchema.parse(req.body);

    const product = await service.create(req.user!, body);

    res
      .status(201)
      .json(ApiResponse.success(product, "Product created successfully"));
  }
  async getAll(req: Request, res: Response) {
    const query = getProductsSchema.parse(req.query);

    const products = await service.getAll(query);

    res.json(ApiResponse.success(products));
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      throw new AppError(400, "Product ID is missing from the request URL");
    }
    const product = await service.getById(id);
    res.json(ApiResponse.success(product));
  }

  async update(req: Request, res: Response) {
    const body = updateProductSchema.parse(req.body);

    const product = await service.update(req.user, req.params.id, body);

    res.json(ApiResponse.success(product, "Product updated successfully"));
  }

  async archive(req: Request, res: Response) {
    await service.archive(req.user, req.params.id);

    res.json(ApiResponse.success(null, "Product archived successfully"));
  }

  async getMine(req: Request, res: Response) {
    const query = getProductsSchema.parse(req.query);

    const products = await service.getMine(req.user, query);

    res.json(ApiResponse.success(products));
  }
}
