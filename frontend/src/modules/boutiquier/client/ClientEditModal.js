import { AbstractClientModal } from "./AbstractClientModal.js";

export class ClientEditModal extends AbstractClientModal {
  constructor(app, client) {
    super(app, {
      title: "Modifier le client",
      requirePassword: false,
      client,
    });
    this.client = client;
  }

  initForm() {
    if (!this.client) return;

    this.form.querySelector('[name="nom"]').value = this.client.nom || "";
    this.form.querySelector('[name="prenom"]').value =
      this.client.prenom || "";
    this.form.querySelector('[name="email"]').value =
      this.client.email || "";
    this.form.querySelector('[name="password"]').value =
      this.client.password || "";

    if (
      this.client.telephone &&
      this.client.telephone.startsWith("+221")
    ) {
      const tel = this.client.telephone.substring(4);
      this.form.querySelector('[name="telephone"]').value = tel;
    }

    if (this.client.avatar) {
      const preview = this.form.querySelector("#avatar-preview");
      const previewContainer = this.form.querySelector(".avatar-preview");
      preview.src = this.client.avatar;
      previewContainer.classList.remove("hidden");
    }
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    await this.controller.updateClient(this.client.id, formData);
    this.app.eventBus.publish("client:updated");
  }
}
