import { AuthGuard } from "../../../app/core/guard/AuthGuard.js";
import { BoutiquierGuard } from "../../../app/core/guard/RoleGuard.js";
import { ArticleView } from "../article/ArticleListView.js";
import { ClientView } from "../client/ClientListView.js";
import { DetteView } from "../dette/DetteListView.js";
import { ProductView } from "./ProductListView.js";

export const boutiquierRoutes = [
  {
    path: "/boutiquier/products",
    component: ProductView,
    meta: {
      layout: "boutiquier",
      requiresAuth: true,
      requiredRole: "boutiquier",
      title: "Mes produits",
    },
    guards: [AuthGuard, BoutiquierGuard],
  },
  {
    path: "/boutiquier/articles",
    component: ArticleView,
    meta: {
      layout: "boutiquier",
      requiresAuth: true,
      requiredRole: "boutiquier",
      title: "Mes articles",
    },
    guards: [AuthGuard, BoutiquierGuard],
  },
  {
    path: "/boutiquier/dettes",
    component: DetteView,
    meta: {
      layout: "boutiquier",
      requiresAuth: true,
      requiredRole: "boutiquier",
      title: "Mes Dettes",
    },
    guards: [AuthGuard, BoutiquierGuard],
  },
  {
    path: "/boutiquier/clients",
    component: ClientView,
    meta: {
      layout: "boutiquier",
      requiresAuth: true,
      requiredRole: "boutiquier",
      title: "Mes Clients",
    },
    guards: [AuthGuard, BoutiquierGuard],
  },
];
