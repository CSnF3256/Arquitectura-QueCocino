import { EmptyState, SectionTitle } from '../components/ui.js';
import { RecipePhoto } from '../components/RecipePhoto.js';
import { h, recipeIcon, recipeIngredients, recipeMatch, recipesForUser } from '../utils.js';

const {useMemo, useState} = React;

export function RecipesPage({state}) {
  const [selected, setSelected] = useState(null);
  const visibleRecipes = useMemo(() => recipesForUser(state.recipes, state.activeUser), [state.recipes, state.activeUser]);
  const enriched = useMemo(() => visibleRecipes.map((recipe) => ({...recipe, match: recipeMatch(recipe, state.ingredients)})), [visibleRecipes, state.ingredients]);
  const isHealthy = (recipe) => {
    const text = `${recipe.nombre || ''} ${recipe.descripcion || ''} ${(recipe.etiquetas || []).join(' ')} ${recipeIngredients(recipe).join(' ')}`.toLowerCase();
    const healthyWords = /(salud|liger|ensalada|sopa|verdura|vegetal|brócoli|brocoli|zanahoria|tomate|avena|quinua|garbanzo|lenteja|espinaca|calabac|pepino|bowl)/;
    const heavyWords = /(frito|frita|tocino|chorizo|mantequilla|crema|queso|lomo|carne)/;
    return healthyWords.test(text) && !heavyWords.test(text);
  };
  const groups = [
    ['Con lo que tienes', enriched.filter((recipe) => recipe.match.percent >= 70)],
    ['Rápidas', enriched.filter((recipe) => Number(recipe.tiempo) <= 25)],
    ['Económicas', enriched.filter((recipe) => Number(recipe.costo_estimado) <= 4)],
    ['Saludables', enriched.filter(isHealthy)],
    ['Para hoy', enriched.filter((recipe) => (recipe.etiquetas || []).join(' ').toLowerCase().includes('hoy') || recipe.match.percent >= 50)]
  ];
  const selectedVisible = selected && enriched.some((recipe) => String(recipe.id || recipe.nombre) === String(selected.id || selected.nombre));
  const current = selectedVisible ? {...selected, match: recipeMatch(selected, state.ingredients)} : enriched[0];

  return h('section', {className: 'page recipes-page'},
    h(SectionTitle, {eyebrow: 'paso 4', title: 'Recetario editorial'}, 'Explora recetas como una galería culinaria, priorizando tiempo, costo y compatibilidad con tu despensa.'),
    current ? h('article', {className: 'recipe-spotlight'},
      h(RecipePhoto, {recipe: current, fallback: recipeIcon(current.nombre), className: 'spotlight-photo'}),
      h('div', null,
        h('p', {className: 'eyebrow'}, 'detalle destacado'),
        h('h2', null, current.nombre),
        h('p', null, current.descripcion || 'Receta del catálogo QueCocino.'),
        h('div', {className: 'tag-row'},
          h('span', null, `${current.tiempo} min`),
          h('span', null, `$${current.costo_estimado}`),
          h('span', null, current.dificultad || 'media'),
          h('span', null, `${current.match.percent}% match`)
        ),
        current.match.missing.length ? h('p', {className: 'missing'}, `Faltan: ${current.match.missing.join(', ')}`) : h('p', {className: 'owned'}, 'Tienes lo necesario para prepararla.'),
        state.activeUser?.tipo_dieta ? h('p', {className: 'diet-note'}, `Filtrado para dieta: ${state.activeUser.tipo_dieta}`) : null
      )
    ) : null,
    h('div', {className: 'recipe-sections'}, groups.map(([title, recipes]) =>
      h('section', {className: 'recipe-band', key: title},
        h('div', {className: 'band-heading'}, h('h3', null, title), h('small', null, `${recipes.length} recetas`)),
        recipes.length ? h('div', {className: 'recipe-gallery'}, recipes.slice(0, 6).map((recipe) =>
          h('button', {className: 'recipe-card', key: `${title}-${recipe.id || recipe.nombre}`, onClick: () => setSelected(recipe)},
            h(RecipePhoto, {recipe, fallback: recipeIcon(recipe.nombre), className: 'card-photo'}),
            h('strong', null, recipe.nombre),
            h('small', null, `${recipe.tiempo} min · $${recipe.costo_estimado} · ${recipe.dificultad || 'media'}`),
            h('div', {className: 'match-bar'}, h('span', {style: {width: `${recipe.match.percent}%`}})),
            h('em', null, `${recipe.match.percent}% con tu refri`)
          )
        )) : h(EmptyState, {icon: '🥣', title: 'Sin recetas en esta sección', text: 'Agrega más ingredientes o revisa otra categoría compatible con el usuario activo.'})
      )
    ))
  );
}
