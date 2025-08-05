// Helper universal para requests autenticados com JWT
// Redireciona para login se não houver token ou se receber 401
export async function jwtFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('jwt') || localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = '/login';
    return Promise.reject('No JWT');
  }
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`
  };
  const resp = await fetch(url, { ...options, headers });
  if (resp.status === 401) {
    window.location.href = '/login';
    return Promise.reject('Unauthorized');
  }
  return resp;
}
