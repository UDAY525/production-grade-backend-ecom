import type { PoolClient } from "pg";

import { transaction } from "../../../database/transaction";

import { ProductRepository } from "./product.repository";
import type { CreateProductDto } from "./product.types";
import type { AuthUser } from "../../../common/types/auth.types";

export class ProductService {
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
}
