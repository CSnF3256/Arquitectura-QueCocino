import { h, cx } from '../utils.js';
import { getRecipeImage } from '../services/imageService.js';

const {useEffect, useState} = React;

export function RecipePhoto({recipe, fallback, className = ''}) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setImage(null);
    getRecipeImage(recipe)
      .then((result) => {
        if (active) setImage(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [recipe?.nombre]);

  return h('div', {className: cx('recipe-photo', className, loading && 'loading')},
    image?.url ? h('img', {src: image.url, alt: recipe?.nombre || 'Receta QueCocino', loading: 'lazy'}) : h('span', null, fallback || '🍽️'),
    h('small', null, loading ? 'buscando imagen...' : (image?.type === 'recipe' ? 'foto de receta' : 'imagen de ingrediente'))
  );
}
