import { AppLayout } from './layout/AppLayout.js';
import { ChefPage } from './pages/ChefPage.js';
import { FridgePage } from './pages/FridgePage.js';
import { HomePage } from './pages/HomePage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { RecommendationPage } from './pages/RecommendationPage.js';
import { RecipesPage } from './pages/RecipesPage.js';
import { SystemPage } from './pages/SystemPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { VendorsPage } from './pages/VendorsPage.js';
import { useQueCocino } from './hooks/useQueCocino.js';
import { h } from './utils.js';

export function App() {
  const state = useQueCocino();
  const views = {
    inicio: h(HomePage, {state}),
    usuarios: h(UsersPage, {state}),
    refri: h(FridgePage, {state}),
    chef: h(ChefPage, {state}),
    recetario: h(RecipesPage, {state}),
    recomendacion: h(RecommendationPage, {state}),
    notificaciones: h(NotificationsPage, {state}),
    proveedores: h(VendorsPage, {state}),
    sistema: h(SystemPage, {state})
  };

  return h(AppLayout, {state}, views[state.activeView] || views.inicio);
}
