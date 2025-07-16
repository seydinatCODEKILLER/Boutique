import { Modal } from "../../components/modal/Modal.js";

export class BoutiquierFormModal {
  constructor(app) {
    this.app = app;
    this.controller = app.getController("admin");
    this.init();
  }

  init() {
    this.form = document.createElement("form");
    this.form.className = "space-y-4";
    this.form.innerHTML = this.getFormTemplate();

    this.modal = new Modal({
      title: "Ajouter un boutiquier",
      content: this.form,
      size: "lg",
      footerButtons: [
        {
          text: "Annuler",
          className: "btn-ghost",
          onClick: () => this.close(),
          closeOnClick: true,
        },
        {
          text: "Enregistrer",
          className: "btn-primary",
          onClick: (e) => this.handleSubmit(e),
          closeOnClick: false,
        },
      ],
    });

    this.setupEvents();
  }

  getFormTemplate() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Nom</span>
          </label>
          <input type="text" name="nom" class="input input-bordered" required>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Prénom</span>
          </label>
          <input type="text" name="prenom" class="input input-bordered" required>
        </div>

        <div class="form-control md:col-span-2">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" name="email" class="input input-bordered" required>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Téléphone</span>
          </label>
          <input type="tel" name="telephone" class="input input-bordered">
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Mot de passe</span>
          </label>
          <input type="password" name="password" class="input input-bordered" required>
        </div>
      </div>
    `;
  }

  setupEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const boutiquierData = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      password: formData.get("password"),
      role: "boutiquier",
    };

    try {
      await this.controller.createBoutiquier(boutiquierData);
      this.app.services.notifications.show(
        "Boutiquier créé avec succès",
        "success"
      );
      this.close();

      // Rafraîchir la liste
      this.app.eventBus.publish("boutiquiers:refresh");
    } catch (error) {
      console.error("Erreur création boutiquier:", error);
      this.app.services.notifications.show(
        "Erreur lors de la création",
        "error"
      );
    }
  }

  open() {
    console.log("OUVERTURE MODALE !");
    this.form.reset();
    this.modal.open();
  }

  close() {
    this.modal.close();
  }
}
