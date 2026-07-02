import { h, cx } from '../utils.js';

const navItems = [
  ['inicio', '🏡', 'Inicio'],
  ['usuarios', '👥', 'Usuarios'],
  ['refri', '🧊', 'Mi Refri'],
  ['chef', '👩‍🍳', 'Mi Chef'],
  ['recetario', '📖', 'Recetario'],
  ['recomendacion', '✨', 'Recomendación'],
  ['notificaciones', '🔔', 'Notificaciones'],
  ['proveedores', '🤝', 'Proveedores AS2'],
  ['sistema', '🧩', 'Sistema']
];

export function AppLayout({state, children}) {
  return h('div', {className: 'app-frame'},
    h('aside', {className: 'journey-nav'},
      h('div', {className: 'brand'},
        h('span', null, 'QC'),
        h('div', null, h('strong', null, 'QueCocino'), h('small', null, 'cocina inteligente'))
      ),
      h('nav', null, navItems.map(([id, icon, label], index) =>
        h('button', {
          key: id,
          className: cx('journey-step', state.activeView === id && 'active'),
          onClick: () => state.setActiveView(id)
        },
          h('span', {className: 'step-number'}, String(index + 1).padStart(2, '0')),
          h('span', {className: 'step-icon'}, icon),
          h('b', null, label)
        )
      )),
      h('div', {className: 'nav-footer'},
        h('small', null, 'Gateway'),
        h('strong', null, state.system.gateway),
        state.system.fallback ? h('em', null, 'modo visual demo') : h('em', null, 'datos reales')
      )
    ),
    h('main', {className: 'content-stage'}, children),
    state.toast ? h('div', {className: 'toast show'}, state.toast) : null
  );
}
