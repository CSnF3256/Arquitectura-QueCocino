import { Button, SectionTitle, ServicePill } from '../components/ui.js';
import { serviceMap } from '../data/mockData.js';
import { h } from '../utils.js';

export function SystemPage({state}) {
  return h('section', {className: 'page system-page'},
    h(SectionTitle, {eyebrow: 'paso 7', title: 'Ecosistema QueCocino'}, 'Vista técnica integrada al estilo de la app. Solo visualiza estados y enlaces; no cambia servicios ni arquitectura.'),
    h('div', {className: 'system-layout'},
      h('div', {className: 'service-grid'},
        serviceMap.map((name) => h(ServicePill, {key: name, name, status: name === 'API Gateway' ? state.system.gateway : (state.system.gateway === 'DOWN' ? 'DOWN' : 'UP')}))
      ),
      h('div', {className: 'flow-card'},
        h('p', {className: 'eyebrow'}, 'flujo principal'),
        h('div', {className: 'architecture-flow'},
          ['Frontend', 'API Gateway', 'Microservicios', 'RabbitMQ', 'Lambda', 'Notificaciones'].map((item, index) =>
            h(React.Fragment, {key: item},
              h('span', null, item),
              index < 5 ? h('b', null, '→') : null
            )
          )
        ),
        h('div', {className: 'quick-links'},
          h('a', {href: 'http://localhost:8000/docs', target: '_blank'}, 'Swagger'),
          h('a', {href: 'http://localhost:15672', target: '_blank'}, 'RabbitMQ'),
          h('a', {href: 'http://localhost:9090', target: '_blank'}, 'Prometheus')
        ),
        h(Button, {variant: 'soft', onClick: state.checkHealth}, 'Revisar Gateway')
      )
    )
  );
}
