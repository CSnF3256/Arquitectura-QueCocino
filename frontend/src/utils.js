export const h = React.createElement;

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function normalizeItems(data) {
  if (Array.isArray(data)) return data;
  return data?.items || [];
}

export function daysUntil(dateValue) {
  if (!dateValue) return 99;
  const today = new Date();
  const target = new Date(`${dateValue}T00:00:00`);
  return Math.ceil((target - today) / 86400000);
}

export function ingredientIcon(name = '') {
  const icons = {
    arroz: '🍚', pollo: '🍗', tomate: '🍅', cebolla: '🧅', papa: '🥔',
    huevo: '🥚', atún: '🥫', atun: '🥫', pasta: '🍝', brócoli: '🥦',
    brocoli: '🥦', leche: '🥛', queso: '🧀', zanahoria: '🥕'
  };
  const key = name.toLowerCase();
  return icons[key] || '🥘';
}

export function recipeIcon(name = '') {
  const text = name.toLowerCase();
  if (text.includes('arroz')) return '🍛';
  if (text.includes('tortilla')) return '🍳';
  if (text.includes('pasta')) return '🍝';
  if (text.includes('ensalada')) return '🥗';
  if (text.includes('sopa') || text.includes('crema')) return '🥣';
  if (text.includes('pollo')) return '🍗';
  if (text.includes('lomo')) return '🥩';
  return '🍽️';
}

export function recipeMatch(recipe, ingredients) {
  const pantry = new Set(ingredients.map((item) => cleanIngredientName(item.nombre || item.name || item.ingrediente)).filter(Boolean));
  const needed = recipeIngredients(recipe);
  if (!needed.length) return {percent: 64, missing: [], owned: []};
  const owned = needed.filter((item) => pantry.has(cleanIngredientName(item)));
  const missing = needed.filter((item) => !pantry.has(cleanIngredientName(item)));
  return {percent: Math.round((owned.length / needed.length) * 100), missing, owned};
}

export function cleanIngredientName(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.trim().toLowerCase();
  const possible = value.nombre || value.name || value.ingrediente || value.canonicalIngredient || value.canonical_ingredient || value.descripcion;
  if (possible) return String(possible).trim().toLowerCase();
  return '';
}

export function displayIngredient(value) {
  const clean = cleanIngredientName(value);
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Ingrediente';
}

export function recipeIngredients(recipe = {}) {
  const raw = recipe.ingredientes || recipe.ingredientes_principales || recipe.ingredients || recipe.items || [];
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  return list.map(displayIngredient).filter((item) => item && item !== 'Ingrediente');
}

export function recipeDietFlags(recipe = {}) {
  const text = `${recipe.nombre || ''} ${recipe.descripcion || ''} ${recipeIngredients(recipe).join(' ')}`.toLowerCase();
  return {
    hasMeat: /(pollo|carne|lomo|res|cerdo|pescado|atún|atun|jamón|jamon)/.test(text),
    hasDairy: /(leche|queso|crema|mantequilla|yogur|lactosa)/.test(text)
  };
}

export function isRecipeAllowedForUser(recipe, user) {
  const diet = `${user?.tipo_dieta || ''} ${user?.alergias || ''}`.toLowerCase();
  const flags = recipeDietFlags(recipe);
  if ((diet.includes('veget') || diet.includes('vegano')) && flags.hasMeat) return false;
  if ((diet.includes('sin lactosa') || diet.includes('lactosa')) && flags.hasDairy) return false;
  return true;
}

export function recipesForUser(recipes, user) {
  const allowed = recipes.filter((recipe) => isRecipeAllowedForUser(recipe, user));
  return allowed.length ? [...allowed] : [...recipes];
}

export function categoryForIngredient(name = '') {
  const n = name.toLowerCase();
  if (['arroz', 'pasta'].some((x) => n.includes(x))) return 'granos';
  if (['pollo', 'huevo', 'atún', 'atun', 'carne'].some((x) => n.includes(x))) return 'proteina';
  if (['leche', 'queso'].some((x) => n.includes(x))) return 'lacteos';
  if (['papa'].some((x) => n.includes(x))) return 'tuberculos';
  return 'verduras';
}
