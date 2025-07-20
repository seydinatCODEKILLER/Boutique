export class Dette {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.id_client = data.id_client || null;
    this.id_boutiquier = data.id_boutiquier || null;
    this.montant = data.montant || 0;
    this.statut = data.statut || "en_attente";
    this.date_demande =
      data.date_demande || new Date().toISOString().split("T")[0];
    this.date_traitement = data.date_traitement || null;
  }

  generateId() {
    return (
      "dette_" +
      Date.now().toString(36) +
      Math.random().toString(36).substr(2, 5)
    );
  }

  toJSON() {
    return {
      id: this.id,
      id_client: this.id_client,
      id_boutiquier: this.id_boutiquier,
      montant: parseFloat(this.montant),
      statut: this.statut,
      date_demande: this.date_demande,
      date_traitement: this.date_traitement,
    };
  }
}
