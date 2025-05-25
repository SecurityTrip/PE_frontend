async function authorizedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    console.log('[api] authorizedFetch вызван для URL:', url);
    console.log('[api] Токен:', token ? 'присутствует' : 'отсутствует');
    
    if (!token) {
        console.error('[api] Токен отсутствует в localStorage');
        throw new Error('Требуется авторизация');
    }
    
    const headers = options.headers ? { ...options.headers } : {};
    headers['Authorization'] = `Bearer ${token}`;
    
    try {
        const response = await fetch(url, { ...options, headers });
        console.log('[api] Получен ответ:', response.status);
          if (response.status === 403) {
            console.warn('[api] Получен 403, возможно, токен недействителен');
            // localStorage.removeItem('token'); // Не удаляем токен автоматически
            throw new Error('Требуется повторная авторизация');
        }
        
        return response;
    } catch (error) {
        console.error('[api] Ошибка при выполнении запроса:', error);
        throw error;
    }
}

export { authorizedFetch }; 