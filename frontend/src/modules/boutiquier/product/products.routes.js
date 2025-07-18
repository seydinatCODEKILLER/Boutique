import { AuthGuard } from "../../../app/core/guard/AuthGuard.js";
import { BoutiquierGuard } from "../../../app/core/guard/RoleGuard.js";
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
];
