export class AdminController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("admin");
    this.boutiquiers = [];
    this.cache = {
      boutiquiers: null,
      lastUpdated: null,
    };
  }

  async getDashboardStats() {
    try {
      const rawStats = await this.service.getAllBoutiquiers();
      return this.#formatStats(rawStats);
    } catch (error) {
      console.error("AdminController > getDashboardStats failed:", error);
      throw error;
    }
  }

  async loadBoutiquiers(forceRefresh = false) {
    try {
      if (!forceRefresh && this.cache.boutiquiers && this.isCacheValid()) {
        return this.cache.boutiquiers;
      }

      const boutiquiers = await this.service.getAllBoutiquiers();
      this.cache.boutiquiers = boutiquiers;
      this.cache.lastUpdated = Date.now();
      return boutiquiers;
    } catch (error) {
      this.app.services.notifications.show(
        "Impossible de charger les boutiquiers",
        "error"
      );
      throw error;
    }
  }

  async createBoutiquier(formData) {
    try {
      const result = await this.service.createBoutiquier(formData);

      this.cache.boutiquiers = null;
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

  async handleBoutiquierAction(action, id) {
    switch (action) {
      case "edit":
        return this.#editBoutiquier(id);
      case "delete":
        return this.#deleteBoutiquier(id);
      default:
        throw new Error(`Action ${action} non supportée`);
    }
  }

  async #editBoutiquier(id) {
    console.log(id);
  }

  async #deleteBoutiquier(id) {
    console.log(id);
  }

  #formatStats(rawStats) {
    return {
      total: rawStats.length,
      active: rawStats.filter((b) => !b.deleted).length,
      deleted: rawStats.filter((b) => b.deleted).length,
    };
  }
}
