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

export function scoreRecipeForChef(recipe, ingredients, preferences = {}) {
  const match = recipeMatch(recipe, ingredients);
  const text = `${recipe.nombre || ''} ${recipe.descripcion || ''} ${(recipe.etiquetas || []).join(' ')} ${recipeIngredients(recipe).join(' ')}`.toLowerCase();
  const notes = String(preferences.notes || '').toLowerCase();
  const expiringNames = new Set((preferences.expiringIngredients || []).map((item) => cleanIngredientName(item.nombre)));
  let score = match.percent * 3;

  if (preferences.time && Number(recipe.tiempo || 999) <= Number(preferences.time)) score += 28;
  if (preferences.budget && Number(recipe.costo_estimado || 999) <= Number(preferences.budget)) score += 28;
  if (preferences.avoidShopping) score += Math.max(0, 24 - match.missing.length * 8);
  if (preferences.useExpiring) {
    const usesExpiring = recipeIngredients(recipe).some((item) => expiringNames.has(cleanIngredientName(item)));
    if (usesExpiring) score += 34;
  }

  const mood = preferences.mood || '';
  if (mood === 'rapido' && Number(recipe.tiempo || 999) <= 25) score += 35;
  if (mood === 'economico' && Number(recipe.costo_estimado || 999) <= 4) score += 35;
  if (mood === 'ligero' && /(ensalada|sopa|verdura|vegetal|brócoli|brocoli|tomate|ligera|saludable)/.test(text)) score += 30;
  if (mood === 'casero' && /(tortilla|arroz|papa|sopa|caser|familiar|horno)/.test(text)) score += 30;

  const noteTokens = notes
    .split(/[^a-záéíóúñü]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);
  for (const token of noteTokens) {
    if (text.includes(token)) score += 16;
  }

  if (/sin grasa|poca grasa|ligero|ligera/.test(notes) && /(frito|frita|crema|queso|carne|lomo)/.test(text)) score -= 40;
  if (/noche|cena/.test(notes) && Number(recipe.tiempo || 999) <= 35) score += 14;
  if (/tomate|papa|arroz|huevo|pollo|brócoli|brocoli|zanahoria|pasta|queso/.test(notes)) {
    const wanted = notes.match(/tomate|papa|arroz|huevo|pollo|brócoli|brocoli|zanahoria|pasta|queso/g) || [];
    for (const item of wanted) {
      if (text.includes(item)) score += 22;
    }
  }

  return score;
}

export function categoryForIngredient(name = '') {
  const n = name.toLowerCase();
  if (['arroz', 'pasta'].some((x) => n.includes(x))) return 'granos';
  if (['pollo', 'huevo', 'atún', 'atun', 'carne'].some((x) => n.includes(x))) return 'proteina';
  if (['leche', 'queso'].some((x) => n.includes(x))) return 'lacteos';
  if (['papa'].some((x) => n.includes(x))) return 'tuberculos';
  return 'verduras';
}
