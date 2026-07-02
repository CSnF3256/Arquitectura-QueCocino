import { api } from '../services/api.js';
import { mockIngredients, mockRecipes, mockUsers } from '../data/mockData.js';
import { isRecipeAllowedForUser, normalizeItems, recipeMatch, recipesForUser } from '../utils.js';

const {useEffect, useMemo, useState} = React;

export function useQueCocino() {
  const [activeView, setActiveView] = useState('inicio');
  const [activeUserId, setActiveUserId] = useState(localStorage.getItem('quecocino_usuario_id') || '');
  const [users, setUsers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [system, setSystem] = useState({gateway: 'checking', fallback: false});
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationSeed, setRecommendationSeed] = useState(0);

  const activeUser = useMemo(
    () => users.find((user) => String(user.id) === String(activeUserId)) || users[0] || null,
    [users, activeUserId]
  );

  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 2800);
  }

  async function loadUsers() {
    setLoading((s) => ({...s, users: true}));
    try {
      const data = await api.users();
      setUsers(data.length ? data : mockUsers);
      if (!activeUserId && data[0]?.id) setActiveUser(String(data[0].id));
    } catch (error) {
      setUsers(mockUsers);
      setSystem((s) => ({...s, fallback: true}));
      if (!activeUserId) setActiveUser(String(mockUsers[0].id));
    } finally {
      setLoading((s) => ({...s, users: false}));
    }
  }

  async function loadIngredients(userId = activeUserId) {
    setLoading((s) => ({...s, ingredients: true}));
    try {
      if (!userId) throw new Error('No user');
      const data = await api.pantry(userId);
      setIngredients(normalizeItems(data));
    } catch (error) {
      setIngredients(mockIngredients);
      setSystem((s) => ({...s, fallback: true}));
    } finally {
      setLoading((s) => ({...s, ingredients: false}));
    }
  }

  async function loadRecipes() {
    setLoading((s) => ({...s, recipes: true}));
    try {
      const data = await api.recipes();
      setRecipes(data.length ? data : mockRecipes);
    } catch (error) {
      setRecipes(mockRecipes);
      setSystem((s) => ({...s, fallback: true}));
    } finally {
      setLoading((s) => ({...s, recipes: false}));
    }
  }

  async function loadNotifications() {
    setLoading((s) => ({...s, notifications: true}));
    try {
      const data = await api.notifications();
      setNotifications(data);
      const last = data[data.length - 1];
      if (last) {
        const notificationAsRecipe = {nombre: last.mensaje || '', descripcion: last.mensaje || '', ingredientes: []};
        if (!isRecipeAllowedForUser(notificationAsRecipe, activeUser)) {
          const candidates = recipesForUser(recipes.length ? recipes : mockRecipes, activeUser);
          const compatible = [...candidates].sort((a, b) => recipeMatch(b, ingredients).percent - recipeMatch(a, ingredients).percent)[0];
          setRecommendation({
            estado: 'REVISAR_DIETA',
            mensaje: `El resultado recibido no parece compatible con la dieta de ${activeUser?.nombre || 'este usuario'}. Te muestro una alternativa visual compatible.`,
            receta: compatible?.nombre,
            source: 'frontend-filter'
          });
        } else {
          setRecommendation({estado: 'LISTA', mensaje: last.mensaje, source: 'notificacion'});
        }
      }
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading((s) => ({...s, notifications: false}));
    }
  }

  async function checkHealth() {
    try {
      const data = await api.health();
      setSystem({gateway: data.gateway || 'UP', fallback: false});
    } catch (error) {
      setSystem({gateway: 'DOWN', fallback: true});
    }
  }

  function setActiveUser(id) {
    setActiveUserId(String(id));
    localStorage.setItem('quecocino_usuario_id', String(id));
  }

  async function createUser(payload) {
    setLoading((s) => ({...s, createUser: true}));
    try {
      const created = await api.createUser(payload);
      setActiveUser(created.id);
      await loadUsers();
      notify(`Usuario ${created.nombre || created.id} listo para cocinar`);
      return created;
    } catch (error) {
      const local = {...payload, id: Date.now()};
      setUsers((current) => [local, ...current]);
      setActiveUser(local.id);
      notify('Usuario creado en modo demo');
      return local;
    } finally {
      setLoading((s) => ({...s, createUser: false}));
    }
  }

  async function addIngredient(payload) {
    setLoading((s) => ({...s, addIngredient: true}));
    try {
      await api.addIngredient({...payload, usuario_id: Number(activeUserId)});
      await loadIngredients(activeUserId);
      notify(`${payload.nombre} guardado en tu refri`);
    } catch (error) {
      setIngredients((current) => [{...payload, id: Date.now()}, ...current]);
      notify(`${payload.nombre} agregado en modo demo`);
    } finally {
      setLoading((s) => ({...s, addIngredient: false}));
    }
  }

  async function requestRecommendation() {
    if (!activeUserId) {
      notify('Primero selecciona un usuario');
      setActiveView('usuarios');
      return;
    }
    const nextSeed = recommendationSeed + 1;
    setRecommendationSeed(nextSeed);
    setLoading((s) => ({...s, recommendation: true}));
    setRecommendation({estado: 'ANALIZANDO', mensaje: 'Preparando recomendación'});
    try {
      const data = await api.recommend(activeUserId);
      setRecommendation({...data, estado: data.estado || 'PENDIENTE'});
      notify('Solicitud enviada al motor de recomendación');
      window.setTimeout(loadNotifications, 3200);
    } catch (error) {
      const candidates = recipesForUser(recipes.length ? recipes : mockRecipes, activeUser)
        .sort((a, b) => recipeMatch(b, ingredients).percent - recipeMatch(a, ingredients).percent);
      const shortlist = candidates.slice(0, Math.min(5, candidates.length));
      const recipe = shortlist[nextSeed % shortlist.length] || candidates[0] || mockRecipes[0];
      setRecommendation({estado: 'DEMO', mensaje: `Hoy te conviene preparar ${recipe.nombre}.`, receta: recipe.nombre});
      notify('Recomendación demo generada');
    } finally {
      setLoading((s) => ({...s, recommendation: false}));
    }
  }

  useEffect(() => {
    checkHealth();
    loadUsers();
    loadRecipes();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (activeUserId) loadIngredients(activeUserId);
  }, [activeUserId]);

  return {
    activeView, setActiveView, activeUserId, setActiveUser, activeUser,
    users, ingredients, recipes, notifications, system, loading, toast,
    recommendation, recommendationSeed, loadNotifications, requestRecommendation, createUser,
    addIngredient, notify, checkHealth
  };
}
