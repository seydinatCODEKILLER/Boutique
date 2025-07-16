export class AdminController {
  constructor(app) {
    this.app = app;
    this.service = app.getService("admin");
    this.boutiquiers = [];
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

  async loadBoutiquiers() {
    try {
      this.boutiquiers = await this.service.getAllBoutiquiers();
      return this.boutiquiers;
    } catch (error) {
      console.error("AdminController > loadBoutiquiers failed:", error);
      throw error;
    }
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
