import { Button, SectionTitle } from '../components/ui.js';
import { daysUntil, h, ingredientIcon } from '../utils.js';

const {useEffect, useMemo, useState} = React;

export function ChefPage({state}) {
  const user = state.activeUser;
  const [mood, setMood] = useState(state.chefPreferences.mood || 'ligero');
  const [time, setTime] = useState(state.chefPreferences.time || user?.tiempo_disponible || 30);
  const [budget, setBudget] = useState(state.chefPreferences.budget || user?.presupuesto || 5);
  const [useExpiring, setUseExpiring] = useState(state.chefPreferences.useExpiring ?? true);
  const [avoidShopping, setAvoidShopping] = useState(state.chefPreferences.avoidShopping ?? true);
  const [notes, setNotes] = useState(state.chefPreferences.notes || '');

  const expiring = useMemo(
    () => state.ingredients.filter((item) => daysUntil(item.fecha_vencimiento) <= 4).slice(0, 4),
    [state.ingredients]
  );

  const moodOptions = [
    ['ligero', '🌿', 'Ligero'],
    ['economico', '💸', 'Económico'],
    ['rapido', '⚡', 'Rápido'],
    ['casero', '🍲', 'Casero']
  ];

  const currentPreferences = {mood, time: Number(time), budget: Number(budget), useExpiring, avoidShopping, notes};

  useEffect(() => {
    state.setChefPreferences(currentPreferences);
  }, [mood, time, budget, useExpiring, avoidShopping, notes]);

  return h('section', {className: 'page chef-page'},
    h(SectionTitle, {eyebrow: 'paso 3', title: 'Mi Chef QueCocino'}, 'No reemplaza tus preferencias de usuario: define la intención de la comida de hoy y luego usa el endpoint real de recomendación.'),
    h('div', {className: 'chef-studio'},
      h('article', {className: 'chef-card'},
        h('div', {className: 'chef-badge'}, '👩‍🍳'),
        h('div', null,
          h('p', {className: 'eyebrow'}, 'chef inteligente'),
          h('h3', null, `Hola ${user?.nombre?.split(' ')[0] || 'chef'}, afinemos la decisión.`),
          h('p', null, 'Tus datos base ya viven en Usuarios. Aquí solo eliges el contexto de hoy: rapidez, gasto, antojo y si quieres salvar ingredientes por vencer.')
        )
      ),
      h('div', {className: 'chef-decision-panel'},
        h('section', {className: 'chef-section'},
          h('h3', null, '¿Qué estilo buscas?'),
          h('div', {className: 'mood-grid'}, moodOptions.map(([id, icon, label]) =>
            h('button', {key: id, className: mood === id ? 'mood active' : 'mood', onClick: () => setMood(id)},
              h('span', null, icon),
              h('b', null, label)
            )
          ))
        ),
        h('section', {className: 'chef-section controls-two'},
          h('label', {className: 'slider-field better'},
            h('span', null, `Tiempo máximo: ${time} min`),
            h('input', {type: 'range', min: '10', max: '90', value: time, onChange: (e) => setTime(e.target.value)})
          ),
          h('label', {className: 'slider-field better'},
            h('span', null, `Presupuesto objetivo: $${budget}`),
            h('input', {type: 'range', min: '2', max: '12', value: budget, onChange: (e) => setBudget(e.target.value)})
          )
        ),
        h('section', {className: 'chef-section toggle-list'},
          h('button', {className: useExpiring ? 'toggle active' : 'toggle', onClick: () => setUseExpiring(!useExpiring)}, h('span', null, '⚠️'), h('b', null, 'Priorizar ingredientes por vencer')),
          h('button', {className: avoidShopping ? 'toggle active' : 'toggle', onClick: () => setAvoidShopping(!avoidShopping)}, h('span', null, '🧺'), h('b', null, 'Evitar lista de compras larga'))
        ),
        h('section', {className: 'chef-section'},
          h('h3', null, 'Ingredientes que conviene usar'),
          expiring.length ? h('div', {className: 'chef-ingredients'}, expiring.map((item) =>
            h('span', {key: item.id || item.nombre}, `${ingredientIcon(item.nombre)} ${item.nombre}`)
          )) : h('p', {className: 'muted'}, 'No hay ingredientes urgentes en este momento.')
        ),
        h('section', {className: 'chef-section'},
          h('h3', null, 'Nota para la decisión visual'),
          h('textarea', {value: notes, onChange: (e) => setNotes(e.target.value), placeholder: 'Ej: quiero algo para la noche, sin mucha grasa, usando tomate...'})
        )
      ),
      h('aside', {className: 'chef-summary-card'},
        h('p', {className: 'eyebrow'}, 'resumen para hoy'),
        h('h3', null, user?.nombre || 'Selecciona un usuario'),
        h('ul', null,
          h('li', null, `Dieta base: ${user?.tipo_dieta || 'normal'}`),
          h('li', null, `Alergias: ${user?.alergias || 'sin registrar'}`),
          h('li', null, `Intención: ${mood}`),
          h('li', null, `Tiempo: ${time} min`),
          h('li', null, `Presupuesto: $${budget}`),
          h('li', null, useExpiring ? 'Usar próximos a vencer' : 'No priorizar vencimientos'),
          h('li', null, avoidShopping ? 'Minimizar compras' : 'Permitir compras extra')
        ),
        notes ? h('p', {className: 'chef-note'}, notes) : null,
        h(Button, {onClick: () => { state.setChefPreferences(currentPreferences); state.setActiveView('recomendacion'); state.requestRecommendation(); }}, 'Solicitar recomendación')
      )
    )
  );
}
