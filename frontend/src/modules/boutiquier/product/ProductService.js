import { AbstractService } from "../../../app/core/AbstractService.js";
import { Product } from "../../../models/Product.js";

export class ProductService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getProducts(boutiquierId) {
    try {
      const produits = await this.api.get(
        `/produits?id_boutiquier=${boutiquierId}`
      );

      return produits;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(data) {
    try {
      const idProduit = await this.generateId("/produits");

      const product = new Product({ ...data, id: idProduit });
      const productData = product.toJSON();

      const productResponse = await this.api.post("/produits", {
        id: idProduit,
        ...productData,
      });

      return productResponse;
    } catch (error) {
      throw error;
    }
  }
}
