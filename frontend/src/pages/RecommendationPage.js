import { Button, SectionTitle } from '../components/ui.js';
import { h, recipeIcon, recipeMatch, recipesForUser } from '../utils.js';

const steps = ['Analizando tu refri', 'Revisando preferencias', 'Comparando recetas', 'Calculando mejor opción', 'Recomendación lista'];

export function RecommendationPage({state}) {
  const best = recipesForUser(state.recipes, state.activeUser)
    .sort((a, b) => recipeMatch(b, state.ingredients).percent - recipeMatch(a, state.ingredients).percent)[0];
  const match = best ? recipeMatch(best, state.ingredients) : {percent: 0, owned: [], missing: []};
  const busy = state.loading.recommendation || state.recommendation?.estado === 'ANALIZANDO';
  const pending = state.recommendation?.estado === 'PENDIENTE';

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
          h('span', null, `${match.percent}% match`)
        ),
        h('div', {className: 'owned-missing'},
          h('div', null, h('b', null, 'Ya tienes'), h('small', null, match.owned.length ? match.owned.join(', ') : 'por confirmar')),
          h('div', null, h('b', null, 'Faltantes'), h('small', null, match.missing.length ? match.missing.join(', ') : 'sin faltantes detectados'))
        ),
        h('div', {className: 'hero-actions'},
          h(Button, {variant: 'soft', onClick: () => state.notify('Lista de compras preparada visualmente')}, 'Ver lista de compras'),
          h(Button, {variant: 'soft', onClick: state.requestRecommendation}, 'Pedir otra recomendación')
        )
      )
    )
  );
}
