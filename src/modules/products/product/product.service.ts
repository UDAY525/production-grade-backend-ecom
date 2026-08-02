import { transaction } from "../../../database/transaction";

import { ProductRepository } from "./product.repository";

import type { CreateProductDto, GetProductsQuery } from "./product.types";

import type { AuthUser } from "../../../common/types/auth.types";
import { NotFoundError } from "../../../common/errors/NotFoundError";

export class ProductService {
  private readonly repository = new ProductRepository();

  async create(user: AuthUser, data: CreateProductDto) {
    return transaction(async (client) => {
      const repository = new ProductRepository(client);

      const { rows } = await repository.createProduct(user.sub, data, user.sub);

      const productId = rows[0].id;

      await repository.addCategories(productId, data.categoryIds);

      for (const variant of data.variants) {
        const { rows } = await repository.createVariant(productId, variant);

        const variantId = rows[0].id;

        await repository.createInventory(variantId, variant.inventory);

        await repository.createImages(productId, variantId, variant.images);
      }

      return { id: productId };
    });
  }

  async getAll(query: GetProductsQuery) {
    const { rows } = await this.repository.getAll(query);

    return rows;
  }

  async getById(productId: string) {
    const { rows } = await this.repository.findById(productId);

    if (!rows.length) {
      throw new NotFoundError("Product not found");
    }

    return rows[0];
  }
}
