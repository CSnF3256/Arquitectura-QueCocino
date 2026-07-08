import { Button, Field, SectionTitle } from '../components/ui.js';
import { categoryForIngredient, cx, daysUntil, h, ingredientIcon } from '../utils.js';

const {useMemo, useState} = React;

const categories = ['todos', 'verduras', 'proteina', 'granos', 'lacteos', 'tuberculos'];

export function FridgePage({state}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todos');
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({nombre: 'arroz', cantidad: 1, unidad: 'kg', fecha_vencimiento: '2026-07-07'});
  const update = (key, value) => setForm((current) => ({...current, [key]: value}));

  const items = useMemo(() => state.ingredients.filter((item) => {
    const realCategory = item.categoria || categoryForIngredient(item.nombre);
    const matchesCategory = category === 'todos' || realCategory === category;
    const matchesQuery = !query || item.nombre?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  }), [state.ingredients, query, category]);

  const expiring = state.ingredients.filter((item) => daysUntil(item.fecha_vencimiento) <= 4).slice(0, 4);

  async function submit(event) {
    event.preventDefault();
    await state.addIngredient({...form, cantidad: Number(form.cantidad)});
    setForm({nombre: '', cantidad: 1, unidad: 'unidad', fecha_vencimiento: ''});
    setOpen(true);
  }

  return h('section', {className: 'page fridge-page'},
    h(SectionTitle, {eyebrow: 'paso 2', title: 'Mi Refri digital'}, 'Una refrigeradora interactiva para cocinar con lo que ya tienes y rescatar ingredientes antes de que venzan.'),
    h('div', {className: 'fridge-toolbar'},
      h('input', {value: query, onChange: (e) => setQuery(e.target.value), placeholder: 'Buscar ingrediente...'}),
      h('div', {className: 'filter-row'}, categories.map((item) =>
        h('button', {key: item, className: cx('filter-chip', category === item && 'active'), onClick: () => setCategory(item)}, item)
      )),
      h('strong', null, `${items.length} ingredientes`)
    ),
    h('div', {className: 'fridge-layout-new'},
      h('div', {className: cx('digital-fridge fridge-appliance', open && 'open')},
        h('button', {className: 'fridge-door-visual', type: 'button', onClick: () => setOpen(!open), 'aria-label': open ? 'Cerrar refrigeradora' : 'Abrir refrigeradora'},
          h('span', {className: 'fridge-logo'}, 'QC'),
          h('span', {className: 'fridge-magnet tomato'}, 'tomate'),
          h('span', {className: 'fridge-magnet note'}, 'hoy'),
          h('span', {className: 'fridge-handle-visual'}),
          h('small', null, open ? 'clic para cerrar' : 'clic para abrir')
        ),
        h('div', {className: 'fridge-interior'},
          h('div', {className: 'fridge-top'}, h('span', null, 'QueCocino Fresh'), h('b', null, state.activeUser?.nombre || 'Sin usuario')),
          h('div', {className: 'fridge-shelves'},
            items.map((item) => {
              const urgent = daysUntil(item.fecha_vencimiento) <= 4;
              return h('article', {key: item.id || item.nombre, className: cx('ingredient-token', urgent && 'urgent')},
                h('span', {className: 'ingredient-emoji'}, ingredientIcon(item.nombre)),
                h('div', null,
                  h('strong', null, item.nombre),
                  h('small', null, `${item.cantidad} ${item.unidad || 'unidad'}`)
                ),
                h('em', null, item.fecha_vencimiento ? `${daysUntil(item.fecha_vencimiento)} dias` : 'sin fecha'),
                h('button', {
                  className: 'remove-ingredient',
                  type: 'button',
                  title: `Quitar ${item.nombre}`,
                  disabled: state.loading.removeIngredient === item.id,
                  onClick: () => state.removeIngredient(item)
                }, 'x')
              );
            })
          )
        )
      ),
      h('aside', {className: 'fridge-side'},
        h(Button, {type: 'button', variant: 'soft', onClick: () => setOpen(!open)}, open ? 'Cerrar refrigeradora' : 'Abrir refrigeradora'),
        h('article', {className: 'expiry-alert'},
          h('p', {className: 'eyebrow'}, 'alertas frescas'),
          h('h3', null, 'Proximos a vencer'),
          expiring.length ? expiring.map((item) =>
            h('div', {className: 'expiry-row', key: `alert-${item.id || item.nombre}`},
              h('span', null, ingredientIcon(item.nombre)),
              h('b', null, item.nombre),
              h('small', null, `${daysUntil(item.fecha_vencimiento)} dias`)
            )
          ) : h('p', {className: 'muted'}, 'No hay vencimientos urgentes.')
        ),
        h('form', {className: 'organic-form compact', onSubmit: submit},
          h('p', {className: 'eyebrow'}, 'agregar ingrediente'),
          h(Field, {label: 'Ingrediente'}, h('input', {value: form.nombre, required: true, onChange: (e) => update('nombre', e.target.value)})),
          h('div', {className: 'form-grid'},
            h(Field, {label: 'Cantidad'}, h('input', {type: 'number', min: '0', step: '0.1', value: form.cantidad, onChange: (e) => update('cantidad', e.target.value)})),
            h(Field, {label: 'Unidad'}, h('input', {value: form.unidad, onChange: (e) => update('unidad', e.target.value)}))
          ),
          h(Field, {label: 'Vence'}, h('input', {type: 'date', value: form.fecha_vencimiento, onChange: (e) => update('fecha_vencimiento', e.target.value)})),
          h(Button, {type: 'submit', disabled: state.loading.addIngredient}, state.loading.addIngredient ? 'Guardando...' : 'Guardar en refri')
        )
      )
    )
  );
}
