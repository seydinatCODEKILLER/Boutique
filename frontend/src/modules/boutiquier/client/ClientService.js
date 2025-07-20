import { AbstractService } from "../../../app/core/AbstractService.js";
import { Client } from "../../../models/Client.js";

export class ClientService extends AbstractService {
  constructor({ api }) {
    super({ api });
    this.api = api;
  }

  async getClientsByBoutiquier(boutiquierId) {
    try {
      const [utilisateurs, clients, associations, allAssociations] =
        await Promise.all([
          this.api.get("/utilisateurs"),
          this.api.get("/client"),
          this.api.get(`/boutiquier_client?id_boutiquier=${boutiquierId}`),
          this.api.get("/boutiquier_client"),
        ]);

      const associationCountMap = new Map();
      allAssociations.forEach((assoc) => {
        const count = associationCountMap.get(assoc.id_client) || 0;
        associationCountMap.set(assoc.id_client, count + 1);
      });

      return associations.map((assoc) => {
        const client = clients.find((c) => c.id == assoc.id_client);
        const utilisateur = utilisateurs.find(
          (u) => u.id == client?.id_utilisateur
        );

        return {
          ...utilisateur,
          id_client: client?.id,
          has_account: client?.has_account || false,
          date_association: assoc.date_association,
          boutiquiers_count: associationCountMap.get(client?.id) || 0,
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      throw new Error("Impossible de récupérer les clients de ce boutiquier");
    }
  }

  async createClient(data) {
    try {
      const idUtilisateur = String(await this.generateId("/utilisateurs"));
      const idClient = String(await this.generateId("/client"));

      // Création de l'instance Client
      const client = data.has_account
        ? Client.createClientAvecCompte({ ...data, id: idUtilisateur })
        : Client.createClientSansCompte({ ...data, id: idUtilisateur });

      // Préparation des données pour l'API
      const { utilisateur, client: clientData } = client.toApiFormat();

      // Enregistrement en parallèle
      const [userResponse, clientResponse] = await Promise.all([
        this.api.post("/utilisateurs", {
          id: String(idUtilisateur),
          ...utilisateur,
        }),
        this.api.post("/client", {
          id: String(idClient),
          ...clientData,
          id_utilisateur: idUtilisateur,
        }),
      ]);

      if (data.id_boutiquier) {
              const idBoutiquier_client = String(await this.generateId("/boutiquier_client"));
        await client.addBoutiquier(idBoutiquier_client,data.id_boutiquier, idClient, this.api);
      }

      return {
        ...userResponse,
        ...clientResponse,
        has_account: client.has_account,
      };
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw new Error(`Échec de la création du client: ${error.message}`);
    }
  }

  async softDeleteClient(id) {
    try {
      const response = await this.api.patch(`/utilisateurs/${id}`, {
        deleted: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async restoreClient(id) {
    try {
      return await this.api.patch(`/utilisateurs/${id}`, {
        deleted: false,
      });
    } catch (error) {
      throw error;
    }
  }
}
