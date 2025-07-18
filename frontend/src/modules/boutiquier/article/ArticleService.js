import { AbstractService } from "../../../app/core/AbstractService.js";

export class ArticleService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getArticles(boutiquierId) {
    try {
      const articles = await this.api.get(
        `/articles?id_boutiquier=${boutiquierId}`
      );

      return articles;
    } catch (error) {
      throw error;
    }
  }
}
