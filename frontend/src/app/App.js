import { AdminLayout } from "../layout/AdminLayout.js";
import { AuthLayout } from "../layout/AuthLayout.js";
import { BoutiquierLayout } from "../layout/BoutiquierLayout.js";
import { adminRoutes } from "../modules/admin/admin.routes.js";
import { AdminController } from "../modules/admin/AdminController.js";
import { AdminService } from "../modules/admin/AdminService.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { AuthController } from "../modules/auth/AuthController.js";
import { AuthService } from "../modules/auth/AuthService.js";
import { ArticleController } from "../modules/boutiquier/article/ArticleController.js";
import { ArticleService } from "../modules/boutiquier/article/ArticleService.js";
import { ProductController } from "../modules/boutiquier/product/ProductController.js";
import { boutiquierRoutes } from "../modules/boutiquier/product/products.routes.js";
import { ProductService } from "../modules/boutiquier/product/ProductService.js";
import ApiService from "../services/ApiService.js";
import { NotificationService } from "../services/NotificationService.js";
import StorageService from "../services/StorageService.js";
import { hydrateStoreFromLocalStorage } from "../utils/HydrateStore.js";
import { EventBus } from "./core/EventBus.js";
import Router from "./core/Router.js";
import { Store } from "./core/Store.js";

export class App {
  constructor(config) {
    this.eventBus = new EventBus();
    this.store = new Store(config.initialState || {});

    this.services = {
      api: new ApiService(config.apiBaseUrl),
      storage: new StorageService(),
      notifications: new NotificationService(this),
    };

    this.services.auth = new AuthService({
      api: this.services.api,
      storage: this.services.storage,
    });

    this.services.admin = new AdminService({
      api: this.services.api,
    });

    this.services.products = new ProductService({
      api: this.services.api,
    });

    this.services.articles = new ArticleService({
      api: this.services.api,
    });

    this.controllers = {
      Auth: new AuthController(this),
      admin: new AdminController(this),
      product: new ProductController(this),
      article: new ArticleController(this),
    };

    this.router = new Router(this, {
      mode: "hash",
      scrollRestoration: "manual",
    });

    this.router.addLayout("auth", AuthLayout);
    this.router.addLayout("admin", AdminLayout);
    this.router.addLayout("boutiquier", BoutiquierLayout);

    this.router.addRoutes(authRoutes);
    this.router.addRoutes(adminRoutes);
    this.router.addRoutes(boutiquierRoutes);

    this.initModules();
    hydrateStoreFromLocalStorage(this.store, this.services.storage);
    this.router.start();
  }

  initModules() {}

  getService(name) {
    return this.services[name];
  }

  getController(name) {
    return this.controllers[name];
  }
}
