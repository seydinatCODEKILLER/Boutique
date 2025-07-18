export class ProductController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("products");
    this.products = [];
    this.cache = {
      products: null,
      lastUpdated: null,
    };
  }

  async loadProducts() {
    const userId = this.app.store.state.user.id;
    const boutiquier = await this.service.getActorByIdUser(
      userId,
      "boutiquier"
    );
    console.log(boutiquier.id);
    console.log(boutiquier);

    return this.service.getProducts(boutiquier.id);
  }

  async createProduct(ProductData) {
    try {
      const result = await this.service.createProduct(ProductData);

      this.cache.products = null;
      this.app.services.notifications.show(
        "Boutiquier créé avec succès",
        "success"
      );

      this.app.eventBus.publish("boutiquiers:updated");
      return result;
    } catch (error) {
      this.app.services.notifications.show(
        error.message || "Erreur lors de la création",
        "error"
      );
      throw error;
    }
  }

  isCacheValid() {
    return (
      this.cache.lastUpdated &&
      Date.now() - this.cache.lastUpdated < 5 * 60 * 1000
    );
  }

  async handleBoutiquierAction(action, id, actionType) {
    switch (action) {
      case "edit":
        return this.#editProduct(id);
      case "toggleStatus":
        return actionType === "delete"
          ? this.#deleteProduct(id)
          : this.#restoreProduct(id);
      default:
        throw new Error(`Action ${action} non supportée`);
    }
  }

  async #editProduct(id) {}

  async updateProduct(id, data) {}

  async #deleteProduct(id) {}

  async #restoreProduct(id) {}
}
