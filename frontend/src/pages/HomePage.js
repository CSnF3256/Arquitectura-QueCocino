import { Button, Stat } from '../components/ui.js';
import { daysUntil, h, ingredientIcon, recipeIcon, recipeMatch, recipesForUser } from '../utils.js';

export function HomePage({state}) {
  const user = state.activeUser;
  const expiring = state.ingredients.filter((item) => daysUntil(item.fecha_vencimiento) <= 4);
  const suggested = recipesForUser(state.recipes, user)
    .sort((a, b) => recipeMatch(b, state.ingredients).percent - recipeMatch(a, state.ingredients).percent)[0];
  const match = suggested ? recipeMatch(suggested, state.ingredients) : {percent: 0};

  return h('section', {className: 'home-page page'},
    h('div', {className: 'hero-panel'},
      h('div', {className: 'hero-copy'},
        h('p', {className: 'eyebrow'}, 'asistente culinario inteligente'),
        h('h1', null, 'Hola, ¿qué cocinamos hoy?'),
        h('p', null, 'QueCocino cruza tu refri, tus preferencias y el recetario para ayudarte a decidir sin perder tiempo.'),
        h('div', {className: 'hero-actions'},
          h(Button, {onClick: () => state.setActiveView('recomendacion')}, 'Recomendar receta'),
          h(Button, {variant: 'soft', onClick: () => state.setActiveView('refri')}, 'Ver mi refri')
        )
      ),
      h('div', {className: 'kitchen-illustration'},
        h('div', {className: 'chef-orb'}, '👩‍🍳'),
        h('div', {className: 'floating-chip chip-a'}, '🥕 vencer pronto'),
        h('div', {className: 'floating-chip chip-b'}, '🍚 en despensa'),
        h('div', {className: 'floating-chip chip-c'}, '✨ IA culinaria')
      )
    ),
    h('div', {className: 'stats-grid'},
      h(Stat, {label: 'Usuario activo', value: user?.nombre || 'Sin usuario', hint: user?.tipo_dieta || 'crea un perfil'}),
      h(Stat, {label: 'Presupuesto', value: `$${user?.presupuesto || 0}`, hint: 'por comida'}),
      h(Stat, {label: 'Tiempo disponible', value: `${user?.tiempo_disponible || 0} min`, hint: 'preferencia actual'}),
      h(Stat, {label: 'Ingredientes', value: state.ingredients.length, hint: `${expiring.length} por vencer`})
    ),
    h('div', {className: 'home-columns'},
      h('article', {className: 'today-card'},
        h('p', {className: 'eyebrow'}, 'receta sugerida del día'),
        h('div', {className: 'recipe-hero-icon'}, suggested ? recipeIcon(suggested.nombre) : '🍽️'),
        h('h2', null, suggested?.nombre || 'Carga recetas para empezar'),
        h('p', null, suggested?.descripcion || 'Cuando el Gateway responda, aquí aparecerá la mejor opción.'),
        h('div', {className: 'match-ring'}, h('span', null, `${match.percent}%`), h('small', null, 'match'))
      ),
      h('article', {className: 'fresh-card'},
        h('p', {className: 'eyebrow'}, 'ingredientes próximos a vencer'),
        expiring.length ? expiring.slice(0, 5).map((item) =>
          h('div', {className: 'expiry-row', key: item.id || item.nombre},
            h('span', null, ingredientIcon(item.nombre)),
            h('b', null, item.nombre),
            h('small', null, `${daysUntil(item.fecha_vencimiento)} días`)
          )
        ) : h('p', null, 'Tu despensa no tiene alertas urgentes.')
      ),
      h('article', {className: 'system-glance'},
        h('p', {className: 'eyebrow'}, 'estado general'),
        h('h3', null, state.system.gateway === 'DOWN' ? 'Gateway no disponible' : 'Ecosistema listo'),
        h('p', null, state.system.fallback ? 'La interfaz está usando datos demo mientras espera al backend.' : 'Los datos se están leyendo desde el API Gateway.'),
        h(Button, {variant: 'soft', onClick: () => state.setActiveView('sistema')}, 'Ver sistema')
      )
    )
  );
}
