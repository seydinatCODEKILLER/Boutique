import { AbstractService } from "../../app/core/AbstractService.js";

export class AdminService extends AbstractService {
  constructor({ api }) {
    super({ api, endpoint: "/boutiquiers" });
    this.api = api;
  }

  async getAllBoutiquiers() {
    const users = await this.api.get("/utilisateurs");
    const boutiquiers = users.filter((u) => u.role === "boutiquier");
    return boutiquiers;
  }

  async createBoutiquier(data) {
    // Ajoute les champs par défaut
    const payload = {
      ...data,
      deleted: false,
      avatar: "",
      role: "boutiquier",
    };

    const response = await this.api.post("/utilisateurs", payload);
    return response;
  }
}
