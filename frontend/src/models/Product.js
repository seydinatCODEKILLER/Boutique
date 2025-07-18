export class Product {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.nom = data.nom || "";
    this.prix = data.prix || "";
    this.quantite = data.quatite || "";
    this.seuil_alerte = data.seuil_alerte || "";
    this.image = data.image || "";
    this.id_boutiquier = data.id_boutiquier || "";
    this.categorie = data.categorie || "";
    this.date_creation = data.date_creation || "";
    this.deleted = data.deleted || false;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  toJSON() {
    return {
      id: this.id,
      nom: this.nom || "",
      prix: this.prix || "",
      quantite: this.quantite || "",
      seuil_alerte: this.seuil_alerte || "",
      image: this.image || "",
      id_boutiquier: this.id_boutiquier || "",
      categorie: this.categorie || "",
      date_creation: this.date_creation || "",
      deleted: this.deleted || false,
    };
  }
}
