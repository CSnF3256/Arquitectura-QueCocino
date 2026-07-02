import { Button, EmptyState, SectionTitle } from '../components/ui.js';
import { api } from '../services/api.js';
import { h, ingredientIcon, recipeMatch, recipesForUser } from '../utils.js';

const {useEffect, useMemo, useState} = React;

const demoCatalog = [
  {externalProductCode:'ARZ-LG-001', canonicalIngredient:'arroz', category:'cereal', unit:'kg', price:1.25, stock:500, supplierId:'SUP-001'},
  {externalProductCode:'TOM-RD-010', canonicalIngredient:'tomate', category:'verdura', unit:'unidad', price:0.18, stock:1200, supplierId:'SUP-001'},
  {externalProductCode:'POL-FRS-220', canonicalIngredient:'pollo', category:'proteina', unit:'kg', price:4.75, stock:180, supplierId:'SUP-001'},
  {externalProductCode:'PPA-AND-330', canonicalIngredient:'papa', category:'tuberculo', unit:'kg', price:0.85, stock:900, supplierId:'SUP-001'},
  {externalProductCode:'ALB-FRS-015', canonicalIngredient:'albahaca', category:'hierba', unit:'manojo', price:0.65, stock:80, supplierId:'SUP-001'},
  {externalProductCode:'QSO-MAD-140', canonicalIngredient:'queso', category:'lacteo', unit:'kg', price:3.90, stock:140, supplierId:'SUP-001'},
  {externalProductCode:'BRO-FRS-018', canonicalIngredient:'brocoli', category:'verdura', unit:'unidad', price:0.95, stock:260, supplierId:'SUP-VERDE'},
  {externalProductCode:'HVO-CMP-006', canonicalIngredient:'huevo', category:'proteina', unit:'docena', price:2.40, stock:340, supplierId:'SUP-GRANJA'},
  {externalProductCode:'PST-SEM-500', canonicalIngredient:'pasta', category:'cereal', unit:'g', price:1.15, stock:600, supplierId:'SUP-PASTA'},
  {externalProductCode:'ZNH-ORG-050', canonicalIngredient:'zanahoria', category:'verdura', unit:'kg', price:0.70, stock:480, supplierId:'SUP-VERDE'}
];

export function VendorsPage({state}) {
  const [catalog, setCatalog] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const best = useMemo(() => {
    const candidates = recipesForUser(state.recipes, state.activeUser)
      .sort((a, b) => recipeMatch(b, state.ingredients).percent - recipeMatch(a, state.ingredients).percent);
    return candidates[state.recommendationSeed % Math.max(1, candidates.length)];
  }, [state.recipes, state.activeUser, state.ingredients, state.recommendationSeed]);
  const missing = best ? recipeMatch(best, state.ingredients).missing.map((item) => item.toLowerCase()) : [];
  const visibleCatalog = catalog.length ? catalog : demoCatalog;
  const suggestedProducts = visibleCatalog.filter((item) => missing.includes(String(item.canonicalIngredient || '').toLowerCase()));

  async function loadCatalog() {
    setStatus('loading');
    try {
      const data = await api.canonicalCatalog();
      setCatalog(data);
      setMessage(data.length ? 'Catálogo canónico cargado desde AS2 Adapter.' : 'El catálogo todavía está vacío.');
    } catch (error) {
      setCatalog([]);
      setMessage('AS2 Adapter no disponible; mostrando catálogo demo visual.');
    } finally {
      setStatus('idle');
    }
  }

  async function sendDemo() {
    setStatus('sending');
    try {
      await api.sendAs2Catalog({
        supplierId:'SUP-001',
        messageType:'CATALOG_UPDATE',
        items: demoCatalog.map(({supplierId, ...item}) => item)
      });
      setMessage('AS2 procesado: auditoría guardada y evento catalog.updated publicado.');
      await loadCatalog();
    } catch (error) {
      setMessage('No se pudo contactar el AS2 Adapter; se conserva demo visual de proveedores.');
    } finally {
      setStatus('idle');
    }
  }

  useEffect(() => { loadCatalog(); }, []);

  return h('section', {className: 'page vendors-page'},
    h(SectionTitle, {eyebrow: 'integración b2b', title: 'Proveedores AS2'}, 'Simula cómo vendedores externos envían catálogos al ecosistema y cómo QueCocino puede sugerir productos que el usuario no tiene.'),
    h('div', {className: 'as2-hero'},
      h('div', null,
        h('p', {className: 'eyebrow'}, 'AS2 Adapter académico'),
        h('h3', null, 'Catálogos de vendedores para completar tu receta'),
        h('p', null, 'El adaptador recibe un catálogo, registra auditoría en PostgreSQL integración y publica el evento catalog.updated en RabbitMQ.')
      ),
      h('div', {className: 'hero-actions'},
        h(Button, {onClick: sendDemo, disabled: status === 'sending'}, status === 'sending' ? 'Enviando AS2...' : 'Enviar catálogo demo AS2'),
        h(Button, {variant: 'soft', onClick: loadCatalog, disabled: status === 'loading'}, status === 'loading' ? 'Consultando...' : 'Ver catálogo canónico')
      )
    ),
    message ? h('div', {className: 'as2-status'}, h('b', null, 'Estado AS2'), h('span', null, message)) : null,
    h('div', {className: 'vendors-layout'},
      h('article', {className: 'vendor-panel'},
        h('div', {className: 'band-heading'}, h('h3', null, 'Productos sugeridos para faltantes'), h('small', null, `${suggestedProducts.length} coincidencias`)),
        suggestedProducts.length ? h('div', {className: 'vendor-grid'}, suggestedProducts.map((item) => h(ProductCard, {key: item.externalProductCode, item, featured: true})))
          : h(EmptyState, {icon:'🧺', title:'Sin faltantes detectados', text:'Cuando una receta necesite ingredientes extra, aquí aparecerán vendedores AS2 que los ofrecen.'})
      ),
      h('article', {className: 'vendor-panel'},
        h('div', {className: 'band-heading'}, h('h3', null, 'Catálogo canónico'), h('small', null, `${visibleCatalog.length} productos`)),
        h('div', {className: 'vendor-grid'}, visibleCatalog.map((item) => h(ProductCard, {key: item.externalProductCode, item})))
      )
    )
  );
}

function ProductCard({item, featured = false}) {
  return h('article', {className: featured ? 'product-card featured' : 'product-card'},
    h('span', {className: 'product-icon'}, ingredientIcon(item.canonicalIngredient)),
    h('div', null,
      h('h4', null, item.canonicalIngredient),
      h('p', null, `${item.stock} ${item.unit} · $${Number(item.price || 0).toFixed(2)}`),
      h('small', null, `${item.supplierId || 'SUP-001'} · código ${item.externalProductCode}`)
    )
  );
}
