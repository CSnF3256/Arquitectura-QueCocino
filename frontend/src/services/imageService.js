import { cleanIngredientName, recipeIngredients } from '../utils.js';

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const CACHE_KEY = 'quecocino_recipe_images';

const recipeQueries = {
  'arroz con pollo rápido': 'chicken rice',
  'arroz con pollo rapido': 'chicken rice',
  'tortilla de papa': 'spanish tortilla',
  'tortilla española': 'spanish tortilla',
  'tortilla espanola': 'spanish tortilla',
  'pasta al pomodoro': 'arrabiata',
  'ensalada de atún': 'tuna salad',
  'ensalada de atun': 'tuna salad',
  'sopa de verduras': 'vegetable soup',
  'pollo al curry': 'chicken curry',
  'crema de brócoli': 'broccoli soup',
  'crema de brocoli': 'broccoli soup',
  'lomo saltado': 'beef',
  'bowl vegetariano de arroz': 'vegetarian',
  'shakshuka casera': 'shakshuka',
  'papas doradas con queso': 'potato',
  'arroz salteado con huevo': 'egg fried rice',
  'pasta con brócoli': 'pasta',
  'pasta con brocoli': 'pasta',
  'tomates rellenos de arroz': 'stuffed tomatoes',
  'ensalada tibia de papa': 'potato salad',
  'pollo con papas al horno': 'roast chicken',
  'sopa de tomate': 'tomato soup',
  'arepitas de queso': 'cheese',
  'curry vegetal': 'vegetarian curry',
  'frittata de verduras': 'frittata'
};

const ingredientQueries = {
  arroz: 'rice',
  pollo: 'chicken',
  tomate: 'tomato',
  cebolla: 'onion',
  papa: 'potato',
  huevo: 'egg',
  atun: 'tuna',
  'atún': 'tuna',
  pasta: 'pasta',
  brocoli: 'broccoli',
  'brócoli': 'broccoli',
  leche: 'milk',
  queso: 'cheese',
  zanahoria: 'carrot',
  carne: 'beef',
  ajo: 'garlic',
  albahaca: 'basil'
};

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function writeCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function normalize(text = '') {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function ingredientImageUrl(name) {
  const clean = cleanIngredientName(name);
  const query = ingredientQueries[clean] || ingredientQueries[normalize(clean)] || clean;
  if (!query) return '';
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(query.replace(/\s+/g, '_'))}.png`;
}

function mainIngredient(recipe) {
  return recipeIngredients(recipe)[0] || recipe.nombre || '';
}

export async function getRecipeImage(recipe) {
  const cache = readCache();
  const cacheId = normalize(recipe?.nombre || '');
  if (cache[cacheId]) return cache[cacheId];

  const query = recipeQueries[cacheId] || recipe?.nombre || mainIngredient(recipe);
  const fallback = {
    url: ingredientImageUrl(mainIngredient(recipe)),
    source: 'TheMealDB ingredient image',
    type: 'ingredient'
  };

  try {
    const response = await fetch(`${MEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Image search failed');
    const data = await response.json();
    const meal = data?.meals?.[0];
    const result = meal?.strMealThumb
      ? {url: meal.strMealThumb, source: 'TheMealDB recipe image', type: 'recipe'}
      : fallback;
    cache[cacheId] = result;
    writeCache(cache);
    return result;
  } catch (error) {
    cache[cacheId] = fallback;
    writeCache(cache);
    return fallback;
  }
}

export function getIngredientImage(name) {
  return ingredientImageUrl(name);
}
