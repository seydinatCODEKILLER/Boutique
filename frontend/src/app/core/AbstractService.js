export class AbstractService {
  constructor({ api, endpoint }) {
    this.api = api;
    this.endpoint = endpoint;
  }

  async generateId() {
    try {
      const items = await this.api.get(this.endpoint);
      if (!Array.isArray(items) || items.length === 0) {
        return 1;
      }

      const ids = items.map((item) => parseInt(item.id, 10)).filter(Boolean);
      const maxId = Math.max(...ids);

      return maxId + 1;
    } catch (error) {
      console.error("Erreur lors de la génération de l'ID:", error);
      throw new Error("Impossible de générer un nouvel ID");
    }
  }
}
