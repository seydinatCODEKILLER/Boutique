import { AbstractService } from "../../app/core/AbstractService.js";
import { Boutiquier } from "../../models/Boutiquer.js";

export class AdminService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getAllBoutiquiers() {
    const users = await this.api.get("/utilisateurs");
    const boutiquiers = users.filter((u) => u.role === "boutiquier");
    return boutiquiers;
  }

  async createBoutiquier(data) {
    try {
      const idUtilisateur = await this.generateId("/utilisateurs");
      const idBoutiquier = await this.generateId("/boutiquier");

      const boutiquier = new Boutiquier({ ...data, id: idUtilisateur });
      const userData = boutiquier.toJSON();

      const [userResponse, _] = await Promise.all([
        this.api.post("/utilisateurs", {
          id: idUtilisateur,
          ...userData,
        }),
        this.api.post("/boutiquier", {
          id: idBoutiquier,
          id_utilisateur: idUtilisateur,
        }),
      ]);

      return userResponse;
    } catch (error) {
      throw error;
    }
  }
}
