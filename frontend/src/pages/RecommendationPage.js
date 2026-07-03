import { Button, SectionTitle } from '../components/ui.js';
import { daysUntil, h, ingredientIcon, recipeIcon, recipeMatch, recipesForUser, scoreRecipeForChef } from '../utils.js';

const {useMemo, useState} = React;

const steps = ['Analizando tu refri', 'Revisando preferencias', 'Comparando recetas', 'Calculando mejor opción', 'Recomendación lista'];

export function RecommendationPage({state}) {
  const [showShopping, setShowShopping] = useState(false);
  const expiringIngredients = state.ingredients.filter((item) => daysUntil(item.fecha_vencimiento) <= 4);
  const preferences = {...state.chefPreferences, expiringIngredients};
  const candidates = useMemo(() => recipesForUser(state.recipes, state.activeUser)
    .sort((a, b) => scoreRecipeForChef(b, state.ingredients, preferences) - scoreRecipeForChef(a, state.ingredients, preferences)), [state.recipes, state.activeUser, state.ingredients, state.recommendationSeed, state.chefPreferences]);
  const shortlist = candidates.slice(0, Math.min(6, candidates.length));
  const rotated = shortlist[state.recommendationSeed % (shortlist.length || 1)] || candidates[0];
  const fromBackend = state.recommendation?.receta
    ? candidates.find((recipe) => recipe.nombre === state.recommendation.receta)
    : null;
  const best = fromBackend || rotated;
  const match = best ? recipeMatch(best, state.ingredients) : {percent: 0, owned: [], missing: []};
  const busy = state.loading.recommendation || state.recommendation?.estado === 'ANALIZANDO';
  const pending = state.recommendation?.estado === 'PENDIENTE';
  const shoppingItems = match.missing;

  return h('section', {className: 'page recommendation-page'},
    h(SectionTitle, {eyebrow: 'paso 5', title: 'Recomendación inteligente'}, 'La interfaz visualiza el proceso; la decisión real se solicita al Servicio Menú mediante el API Gateway.'),
    h('div', {className: 'recommend-grid'},
      h('div', {className: 'cooking-pot-card'},
        h('div', {className: 'pot-animation'}, h('span', null, '🥘'), h('i', null), h('i', null), h('i', null)),
        h('div', {className: 'process-steps'}, steps.map((step, index) =>
          h('div', {className: busy || index < 4 ? 'process-step active' : 'process-step', key: step},
            h('span', null, index + 1),
            h('b', null, step)
          )
        )),
        h(Button, {onClick: state.requestRecommendation, disabled: busy}, busy ? 'Cocinando respuesta...' : 'Pedir recomendación')
      ),
      h('article', {className: 'recommend-result'},
        h('p', {className: 'eyebrow'}, pending ? 'solicitud pendiente' : 'mejor opción visual'),
        h('div', {className: 'recipe-hero-icon'}, best ? recipeIcon(best.nombre) : '✨'),
        h('h2', null, state.recommendation?.receta || best?.nombre || 'Esperando recetas'),
        h('p', null, state.recommendation?.mensaje || best?.descripcion || 'Cuando el backend procese la solicitud, las notificaciones traerán el resultado.'),
        h('div', {className: 'tag-row'},
          h('span', null, `${best?.tiempo || state.activeUser?.tiempo_disponible || 30} min`),
          h('span', null, `$${best?.costo_estimado || state.activeUser?.presupuesto || 0}`),
          h('span', null, `${match.percent}% match`),
          state.chefPreferences?.mood ? h('span', null, `modo ${state.chefPreferences.mood}`) : null
        ),
        h('div', {className: 'owned-missing'},
          h('div', null, h('b', null, 'Ya tienes'), h('small', null, match.owned.length ? match.owned.join(', ') : 'por confirmar')),
          h('div', null, h('b', null, 'Faltantes'), h('small', null, shoppingItems.length ? shoppingItems.join(', ') : 'sin faltantes detectados'))
        ),
        h('div', {className: 'hero-actions'},
          h(Button, {variant: 'soft', onClick: () => setShowShopping(!showShopping)}, showShopping ? 'Ocultar lista de compras' : 'Ver lista de compras'),
          h(Button, {variant: 'soft', onClick: state.requestRecommendation}, 'Pedir otra recomendación'),
          h(Button, {variant: 'soft', onClick: () => state.setActiveView('proveedores')}, 'Buscar proveedores AS2')
        ),
        showShopping ? h('div', {className: 'shopping-list'},
          h('h3', null, 'Lista de compras sugerida'),
          shoppingItems.length ? shoppingItems.map((item) =>
            h('article', {key: item, className: 'shopping-item'},
              h('span', null, ingredientIcon(item)),
              h('b', null, item),
              h('small', null, 'buscar en proveedores AS2')
            )
          ) : h('p', null, 'No necesitas comprar ingredientes para esta receta.'),
          shoppingItems.length ? h(Button, {variant: 'soft', onClick: () => state.setActiveView('proveedores')}, 'Ver vendedores para faltantes') : null
        ) : null
      )
    )
  );
}
