import { Button, EmptyState, SectionTitle } from '../components/ui.js';
import { h } from '../utils.js';

export function NotificationsPage({state}) {
  return h('section', {className: 'page notifications-page'},
    h(SectionTitle, {eyebrow: 'paso 6', title: 'Bandeja de notificaciones'}, 'Eventos del sistema, recomendaciones generadas y señales útiles aparecen como una línea de tiempo.'),
    h('div', {className: 'timeline-actions'},
      h(Button, {variant: 'soft', onClick: state.loadNotifications}, state.loading.notifications ? 'Actualizando...' : 'Actualizar notificaciones')
    ),
    state.notifications.length ? h('div', {className: 'timeline'},
      state.notifications.slice().reverse().map((item, index) =>
        h('article', {className: 'timeline-item', key: item.id || index},
          h('span', {className: 'timeline-dot'}, item.tipo?.includes('recommend') ? '✨' : '🔔'),
          h('div', null,
            h('small', null, item.tipo || 'evento del sistema'),
            h('h3', null, item.mensaje || 'Notificación recibida'),
            h('p', null, `Usuario: ${item.usuario_id || state.activeUserId || 'general'}`)
          )
        )
      )
    ) : h(EmptyState, {icon: '🔔', title: 'Sin notificaciones todavía', text: 'Solicita una recomendación y vuelve a esta bandeja para consultar el resultado.'})
  );
}
