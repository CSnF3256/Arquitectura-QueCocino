import { cx, h } from '../utils.js';

export function Button({children, className, variant = 'primary', ...props}) {
  return h('button', {...props, className: cx('btn', `btn-${variant}`, className)}, children);
}

export function Stat({label, value, hint}) {
  return h('article', {className: 'stat-card'},
    h('span', {className: 'stat-value'}, value),
    h('small', null, label),
    hint ? h('em', null, hint) : null
  );
}

export function EmptyState({icon = '🍽️', title, text}) {
  return h('div', {className: 'empty-state'},
    h('span', null, icon),
    h('strong', null, title),
    h('p', null, text)
  );
}

export function Field({label, children}) {
  return h('label', {className: 'field'},
    h('span', null, label),
    children
  );
}

export function SectionTitle({eyebrow, title, children}) {
  return h('div', {className: 'section-title'},
    h('p', {className: 'eyebrow'}, eyebrow),
    h('h2', null, title),
    children ? h('p', null, children) : null
  );
}

export function ServicePill({name, status = 'UP'}) {
  const down = String(status).toUpperCase().includes('DOWN');
  return h('div', {className: cx('service-pill', down && 'is-down')},
    h('span', null),
    h('b', null, name),
    h('small', null, down ? 'inactivo' : 'activo')
  );
}
