import { AbstractService } from "../../../app/core/AbstractService.js";

export class DetteService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
    this.endpoint = "/dettes";
  }

  async acceptDette(id) {
    return this.api.patch(`${this.endpoint}/${id}`, { statut: "accepted" });
  }

  async rejectDette(id) {
    return this.api.patch(`${this.endpoint}/${id}`, { statut: "rejected" });
  }

  async getDetteByBoutiquier(boutiquierId) {
    return this.api.get(`${this.endpoint}?id_boutiquier=${boutiquierId}`);
  }
}
