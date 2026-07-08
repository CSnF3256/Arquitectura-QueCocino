export const API_BASE_URL = 'http://localhost:8000';

async function request(path, options = {}) {
  const {headers = {}, ...fetchOptions} = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {'Content-Type': 'application/json', ...headers}
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Gateway respondió ${response.status}${detail ? `: ${detail}` : ''}`);
  }

  return response.json();
}

export const api = {
  health: () => request('/health'),
  users: () => request('/usuarios'),
  user: (id) => request(`/usuarios/${id}`),
  createUser: (payload) => request('/usuarios', {method: 'POST', body: JSON.stringify(payload)}),
  pantry: (userId) => request(`/despensa/usuarios/${userId}`),
  addIngredient: (payload) => request('/despensa/items', {method: 'POST', body: JSON.stringify(payload)}),
  removeIngredient: (id) => request(`/despensa/items/${id}`, {method: 'DELETE'}),
  recipes: () => request('/recetas'),
  recommend: (userId) => request('/menu/recomendacion', {method: 'POST', body: JSON.stringify({usuario_id: Number(userId)})}),
  notifications: () => request('/notificaciones'),
  canonicalCatalog: () => request('/catalog/canonical'),
  sendAs2Catalog: (payload) => request('/as2/inbound', {
    method: 'POST',
    headers: {'AS2-From': 'SUP-001', 'AS2-To': 'QUECOCINO', 'Message-ID': `SUP-001-${Date.now()}`},
    body: JSON.stringify(payload)
  })
};
