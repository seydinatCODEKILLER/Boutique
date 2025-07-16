class Router {
  constructor(app, config = {}) {
    // Configuration de base
    this.app = app;
    this.routes = [];
    this.layouts = new Map();
    this.currentRoute = null;
    this.previousRoute = null;
    this.currentView = null;
    this.currentLayout = null;
    this.history = window.history;

    // Options par défaut
    this.config = {
      root: "/",
      mode: "hash",
      scrollRestoration: "manual",
      defaultLayout: "default",
      ...config,
    };

    // Initialisation
    this.init();
  }

  init() {
    if ("scrollRestoration" in this.history) {
      this.history.scrollRestoration = this.config.scrollRestoration;
    }
    window.addEventListener("popstate", this.handleNavigation.bind(this));
    window.addEventListener("hashchange", this.handleNavigation.bind(this));
    document.addEventListener(
      "DOMContentLoaded",
      this.handleNavigation.bind(this)
    );
    document.addEventListener("click", this.handleLinkClick.bind(this));
  }

  /* ==================== */
  /* === GESTION DES LAYOUTS === */
  /* ==================== */
  /**
   * Ajoute un layout
   * @param {String} name - Nom du layout
   * @param {Class} component - Classe du layout
   */
  addLayout(name, component) {
    if (typeof component !== "function") {
      throw new Error("Layout must be a constructor function");
    }
    this.layouts.set(name, component);
    return this; // Permet le chaînage
  }

  /**
   * Récupère un layout
   * @param {String} name - Nom du layout
   */
  getLayout(name) {
    const layout = this.layouts.get(name || this.config.defaultLayout);
    if (!layout) throw new Error(`Layout "${name}" not registered`);
    return layout;
  }

  /* ==================== */
  /* === GESTION DES ROUTES === */
  /* ==================== */
  /**
   * Ajoute une ou plusieurs routes
   * @param {Array|Object} routes - Routes à ajouter
   * @param {Object} options - Options globales (guards, meta, etc.)
   */
  addRoutes(routes, options = {}) {
    if (!Array.isArray(routes)) routes = [routes];

    routes.forEach((route) => {
      if (!route.path || !route.component) {
        throw new Error("Route must have path and component");
      }

      // Compilation de la route
      const compiledRoute = {
        ...route,
        meta: { ...options.meta, ...route.meta },
        guards: [...(options.guards || []), ...(route.guards || [])],
        middlewares: [
          ...(options.middlewares || []),
          ...(route.middlewares || []),
        ],
        regex: this.pathToRegex(route.path),
        params: this.extractParams(route.path),
        layout: route.meta?.layout || this.config.defaultLayout,
      };

      // Lazy loading si nécessaire
      if (
        typeof compiledRoute.component === "function" &&
        !compiledRoute.component.prototype
      ) {
        compiledRoute._component = compiledRoute.component;
        compiledRoute.component = null;
      }

      this.routes.push(compiledRoute);
    });

    return this; // Chaînage
  }

  /**
   * Convertit un chemin en regex (pour les paramètres dynamiques)
   * @param {String} path - Chemin de la route (ex: `/user/:id`)
   */
  pathToRegex(path) {
    const segments = path
      .replace(/^\//, "")
      .split("/")
      .map((segment) => (segment.startsWith(":") ? "([^/]+)" : segment));

    return new RegExp(`^/${segments.join("/")}$`);
  }

  /**
   * Extrait les noms des paramètres dynamiques
   * @param {String} path - Chemin de la route
   */
  extractParams(path) {
    return path
      .split("/")
      .filter((segment) => segment.startsWith(":"))
      .map((segment) => segment.slice(1));
  }

  /* ==================== */
  /* === NAVIGATION === */
  /* ==================== */
  /**
   * Gère la navigation (popstate, lien cliqué, etc.)
   */
  async handleNavigation() {
    const path = this.getCurrentPath();
    console.log(path);

    const matched = this.matchRoute(path);

    if (!matched) return this.handleNotFound();

    const { route, params } = matched;

    // Vérification des guards (accès)
    if (!(await this.runGuards(route))) return;

    // Transition vers la nouvelle vue
    await this.transitionTo(route, params);
  }

  /**
   * Transition entre vues avec gestion des layouts
   * @param {Object} route - Route cible
   * @param {Object} params - Paramètres dynamiques
   */
  async transitionTo(route, params) {
    try {
      // Chargement asynchrone si nécessaire
      if (route._component && !route.component) {
        route.component = (await route._component()).default;
      }

      // Création de la vue
      const view = new route.component(this.app, { params, route });

      // Middlewares "before"
      await this.runMiddlewares(route, "beforeResolve", view);

      // Gestion du layout
      const LayoutClass = this.getLayout(route.layout);
      const layoutChanged =
        !this.currentLayout || this.currentLayout.constructor !== LayoutClass;

      // Changement de layout si nécessaire
      if (layoutChanged) {
        await this.destroyCurrentLayout();
        this.currentLayout = new LayoutClass(this.app);
        await this.currentLayout.setup();
      }

      // Destruction de l'ancienne vue
      await this.destroyCurrentView();

      // Mise à jour des références
      this.previousRoute = this.currentRoute;
      this.currentRoute = route;
      this.currentView = view;

      // Rendu
      await this.currentLayout.beforeRender?.(view);
      await view.render();
      await this.currentLayout.renderView(view);
      document.title = this.getPageTitle(view, route);

      // Middlewares "after"
      await this.runMiddlewares(route, "afterResolve", view);
      this.handleScroll(route);
    } catch (error) {
      console.error("Routing error:", error);
      this.handleError(error);
    }
  }

  /* ==================== */
  /* === HELPERS === */
  /* ==================== */
  /**
   * Détruit le layout actuel
   */
  async destroyCurrentLayout() {
    if (this.currentLayout) {
      await this.currentLayout.beforeDestroy?.();
      this.currentLayout.destroy?.();
      this.currentLayout = null;
    }
  }

  /**
   * Détruit la vue actuelle
   */
  async destroyCurrentView() {
    if (this.currentView) {
      await this.currentView.beforeDestroy?.();
      this.currentView.destroy?.();
      this.currentView = null;
    }
  }

  /**
   * Trouve une route correspondant au chemin
   * @param {String} path - Chemin à matcher
   */
  matchRoute(path) {
    for (const route of this.routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = this.extractRouteParams(route, match);
        return { route, params };
      }
    }
    return null;
  }

  /**
   * Extrait les paramètres dynamiques depuis le match
   */
  extractRouteParams(route, match) {
    return route.params.reduce((acc, param, index) => {
      acc[param] = match[index + 1];
      return acc;
    }, {});
  }

  /**
   * Exécute les guards de route
   */
  async runGuards(route) {
    if (!route.guards) return true;

    for (const Guard of route.guards) {
      const result = await Guard.execute(this.app, route);
      if (!result.granted) {
        this.navigateTo(result.redirect || "/", { replace: true });
        return false;
      }
    }
    return true;
  }

  /**
   * Exécute les middlewares
   */
  async runMiddlewares(route, hook, view) {
    for (const middleware of route.middlewares) {
      if (typeof middleware[hook] === "function") {
        try {
          await middleware[hook](this.app, route, view);
        } catch (error) {
          console.error(`Middleware ${hook} error:`, error);
        }
      }
    }
  }

  /**
   * Gère le scroll après navigation
   */
  handleScroll(route) {
    if (route.meta?.scrollToTop !== false) {
      window.scrollTo(0, 0);
    } else if (this.config.saveScrollPosition && this.previousRoute) {
      const scrollPos = this.previousRoute.meta.scrollPosition || {
        x: 0,
        y: 0,
      };
      window.scrollTo(scrollPos.x, scrollPos.y);
    }
  }

  /**
   * Gère les clics sur les liens
   */
  handleLinkClick(event) {
    const link = event.target.closest("a[href]");
    if (
      !link ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;

    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return;

    // Si en mode hash, on s'assure que le href commence par #
    if (this.config.mode === "hash" && !href.startsWith("#")) {
      event.preventDefault();
      this.navigateTo(`#${href}`);
      return;
    }

    event.preventDefault();
    this.navigateTo(href);
  }

  /**
   * Navigation programmatique
   */
  navigateTo(path, options = {}) {
    if (path === this.getCurrentPath()) return;

    const normalizedPath = this.normalizePath(path);

    if (this.config.mode === "history") {
      this.history[options.replace ? "replaceState" : "pushState"](
        {},
        "",
        normalizedPath
      );
    } else {
      window.location.hash = normalizedPath;
    }
  }

  /**
   * Normalise un chemin (supprime les doubles slashes, etc.)
   */
  normalizePath(path) {
    if (path.startsWith("#")) return path;
    if (!path.startsWith("/")) {
      const current = this.getCurrentPath().split("/");
      current.pop();
      path = current.join("/") + "/" + path;
    }
    return path.replace(/\/+/g, "/");
  }

  /**
   * Gère les erreurs 404
   */
  handleNotFound() {
    const notFoundRoute = this.routes.find((r) => r.path === "/404");
    if (notFoundRoute) this.navigateTo("/404", { replace: true });
    else console.error("Route not found and no 404 handler");
  }

  /**
   * Gère les erreurs 500
   */
  handleError(error) {
    const errorRoute = this.routes.find((r) => r.path === "/500");
    if (errorRoute) this.navigateTo("/500", { replace: true });
    else console.error("Unhandled routing error:", error);
  }

  /**
   * Retourne le chemin actuel
   */
  getCurrentPath() {
    if (this.config.mode === "hash") {
      const hashPath = window.location.hash.slice(1);
      return hashPath || "/";
    }
    return window.location.pathname.replace(this.config.root, "") || "/";
  }

  /**
   * Retourne le titre de la page
   */
  getPageTitle(view, route) {
    return (
      view.title || route.meta?.title || this.app.config.title || document.title
    );
  }

  /**
   * Démarre le routeur
   */
  start() {
    this.handleNavigation();
  }
}

export default Router;
