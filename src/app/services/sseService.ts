import { authService } from './authService';

// Базовый URL для API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Таймауты для механизма восстановления
const RETRY_TIMEOUT = 8000; // 8 секунд между попытками
const MAX_RETRY_COUNT = 3; // 3 попытки
const CONNECTION_TIMEOUT = 10000; // 10 секунд на установку соединения
const RECONNECT_DELAY = 2000; // 2 секунды
const MAX_TOTAL_RECONNECTS_PER_SESSION = 10; // Максимальное количество попыток за сессию
const GLOBAL_COOLDOWN_AFTER_CLOSE = 5000; // 5 секунд блокировки после закрытия

class SseService {
  private connections: Map<string, EventSource> = new Map();
  private manualMode: boolean = false;
  private retryCount: Map<string, number> = new Map();
  private connectionTimers: Map<string, NodeJS.Timeout> = new Map();
  private connectionAttemptTime: Map<string, number> = new Map();
  private totalReconnectsThisSession: number = 0;
  private hasActiveConnection: boolean = false;
  private forceManualMode: boolean = false;
  private globalCooldownTimer: NodeJS.Timeout | null = null;
  private inGlobalCooldown: boolean = false;
  
  // Подключиться к SSE для получения обновлений списка лобби
  connectToLobbyUpdates(onLobbyListUpdate: (lobbies: any[]) => void, onError?: (error: any) => void): () => void {
    // Если находимся в глобальной блокировке, не пытаемся подключаться
    if (this.inGlobalCooldown) {
      console.log('Система в режиме глобальной блокировки подключений, пропускаем');
      if (onError) onError({ message: 'Система временно заблокирована. Повторите попытку через несколько секунд.' });
      return () => {};
    }
    
    // Если достигнут предел переподключений за сессию или принудительно включен ручной режим - не пытаемся подключаться
    if (this.totalReconnectsThisSession >= MAX_TOTAL_RECONNECTS_PER_SESSION || this.forceManualMode) {
      console.log('Достигнут предел переподключений или включен ручной режим. Использую обычные запросы.');
      if (onError) onError({ message: 'Превышен лимит попыток подключения. Используются обычные запросы.' });
      return () => {};
    }
    
    // Если уже есть активное соединение, не создаем новое
    if (this.hasActiveConnection) {
      console.log('Уже есть активное соединение, пропускаем новое подключение');
      // Возвращаем заглушку
      return () => {};
    }
    
    // Проверяем, не было ли недавнего подключения
    const connectionId = 'lobby_list';
    const lastAttemptTime = this.connectionAttemptTime.get(connectionId) || 0;
    const now = Date.now();
    
    if (now - lastAttemptTime < RECONNECT_DELAY) {
      console.log(`Слишком частые попытки подключения, пропускаем (${now - lastAttemptTime}мс)`);
      // Возвращаем функцию закрытия существующего соединения, если оно есть
      return () => this.closeConnection(connectionId);
    }
    
    // Запоминаем время попытки и увеличиваем счетчик попыток за сессию
    this.connectionAttemptTime.set(connectionId, now);
    this.totalReconnectsThisSession++;
    
    // Если достигли лимита подключений за сессию после увеличения счетчика
    if (this.totalReconnectsThisSession >= MAX_TOTAL_RECONNECTS_PER_SESSION) {
      this.forceManualMode = true;
      if (onError) onError({ 
        message: 'Слишком много попыток подключения. Переключение на обычные запросы.' 
      });
      return () => {};
    }
    
    // Сбрасываем ручной режим при каждой попытке подключения
    this.manualMode = false;
    
    const token = authService.getToken();
    if (!token) {
      if (onError) onError({ message: 'Пользователь не авторизован' });
      return () => {};
    }
    
    // Закрываем существующее соединение, если оно есть
    this.closeConnection(connectionId);
    
    try {
      // Устанавливаем флаг, что мы в процессе подключения ДО создания EventSource
      // чтобы предотвратить гонки данных
      this.hasActiveConnection = true;
      
      // Создаем URL с добавлением токена в параметры запроса
      const url = new URL(`${API_URL}/lobby/sse`);
      url.searchParams.append('token', token);
      
      // Добавляем случайный параметр для предотвращения кеширования
      url.searchParams.append('_', Date.now().toString());
      
      // Создаем новое SSE соединение
      const eventSource = new EventSource(url.toString());
      
      // Сохраняем соединение сразу
      this.connections.set(connectionId, eventSource);
      
      // Очищаем предыдущий таймер, если он существует
      if (this.connectionTimers.has(connectionId)) {
        clearTimeout(this.connectionTimers.get(connectionId));
      }
      
      // Установка таймаута для проверки открытия соединения
      const connectionTimeout = setTimeout(() => {
        console.error('SSE соединение не установлено за отведенное время');
        
        // Сбрасываем флаг активного соединения
        this.hasActiveConnection = false;
        
        // Устанавливаем глобальную блокировку
        this.setGlobalCooldown();
        
        // Не удаляем соединение здесь, просто логируем ошибку
        if (onError) onError({ message: 'Таймаут соединения, пробую переподключиться' });
        
        // Пробуем переподключиться только если соединение ещё существует и не превышен лимит
        if (this.connections.has(connectionId) && !this.forceManualMode) {
          this.retryConnection(connectionId, onLobbyListUpdate, onError);
        } else {
          this.forceManualMode = true;
          if (onError) onError({ 
            message: 'Автоматическое переподключение отключено. Используются обычные запросы.' 
          });
        }
      }, CONNECTION_TIMEOUT);
      
      // Сохраняем таймер для очистки позже
      this.connectionTimers.set(connectionId, connectionTimeout);
      
      // Регистрируем слушатели событий
      eventSource.onopen = () => {
        console.log('SSE соединение для списка лобби установлено');
        
        // Очищаем таймаут
        if (this.connectionTimers.has(connectionId)) {
          clearTimeout(this.connectionTimers.get(connectionId)!);
          this.connectionTimers.delete(connectionId);
        }
        
        // Сбрасываем счетчик повторных попыток при успешном подключении
        this.retryCount.set(connectionId, 0);
      };
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Получены обновления списка лобби через SSE:', data);
          // Сбрасываем счетчик повторных попыток при успешном получении данных
          this.retryCount.set(connectionId, 0);
          onLobbyListUpdate(data);
        } catch (error) {
          console.error('Ошибка при обработке данных SSE:', error);
          if (onError) onError(error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('Ошибка SSE соединения:', error);
        
        // Сбрасываем флаг активного соединения
        this.hasActiveConnection = false;
        
        // Устанавливаем глобальную блокировку
        this.setGlobalCooldown();
        
        // Очищаем таймаут, если он еще активен
        if (this.connectionTimers.has(connectionId)) {
          clearTimeout(this.connectionTimers.get(connectionId)!);
          this.connectionTimers.delete(connectionId);
        }
        
        // Сообщаем об ошибке для включения ручного обновления
        if (onError) onError(error);
        
        // Пробуем переподключиться только если соединение всё ещё в мапе и не превышен лимит
        if (this.connections.has(connectionId) && !this.forceManualMode) {
          this.retryConnection(connectionId, onLobbyListUpdate, onError);
        } else {
          this.forceManualMode = true;
          if (onError) onError({ 
            message: 'Автоматическое переподключение отключено. Используются обычные запросы.' 
          });
        }
      };
      
      // Возвращаем функцию для закрытия соединения
      return () => this.closeConnection(connectionId);
    } catch (error) {
      console.error('Ошибка при создании SSE соединения:', error);
      // Сбрасываем флаг активного соединения
      this.hasActiveConnection = false;
      
      // Устанавливаем глобальную блокировку
      this.setGlobalCooldown();
      
      if (onError) onError(error);
      return () => {};
    }
  }
  
  // Установка глобальной блокировки на подключения
  private setGlobalCooldown(): void {
    // Устанавливаем флаг глобальной блокировки
    this.inGlobalCooldown = true;
    
    // Очищаем предыдущий таймер, если он существует
    if (this.globalCooldownTimer !== null) {
      clearTimeout(this.globalCooldownTimer);
    }
    
    // Устанавливаем таймер для снятия глобальной блокировки
    this.globalCooldownTimer = setTimeout(() => {
      this.inGlobalCooldown = false;
      this.globalCooldownTimer = null;
      console.log('Глобальная блокировка подключений снята');
    }, GLOBAL_COOLDOWN_AFTER_CLOSE);
    
    console.log(`Установлена глобальная блокировка подключений на ${GLOBAL_COOLDOWN_AFTER_CLOSE}мс`);
  }
  
  // Отдельный метод для логики переподключения
  private retryConnection(connectionId: string, onUpdate: any, onError?: (error: any) => void): void {
    // Если глобальная блокировка, пропускаем
    if (this.inGlobalCooldown) {
      console.log('Система в режиме глобальной блокировки, пропускаем переподключение');
      return;
    }
    
    // Проверяем, что соединение существует
    if (!this.connections.has(connectionId)) {
      console.log(`Соединение ${connectionId} уже закрыто, переподключение не требуется`);
      return;
    }
    
    // Если принудительно включен ручной режим, не пытаемся переподключаться
    if (this.forceManualMode) {
      console.log('Ручной режим включен, пропускаем переподключение');
      return;
    }
    
    // Проверяем общее количество переподключений за сессию
    if (this.totalReconnectsThisSession >= MAX_TOTAL_RECONNECTS_PER_SESSION) {
      console.log('Достигнут предел переподключений за сессию, переключение на ручной режим');
      this.forceManualMode = true;
      if (onError) onError({ 
        message: 'Слишком много попыток подключения. Переключение на обычные запросы.' 
      });
      return;
    }
    
    // Закрываем текущее соединение
    this.closeConnection(connectionId);
    
    // Увеличиваем счетчик повторных попыток для текущего соединения
    const currentCount = this.retryCount.get(connectionId) || 0;
    const newCount = currentCount + 1;
    this.retryCount.set(connectionId, newCount);
    
    // Если превышено максимальное количество попыток для текущего соединения
    if (newCount > MAX_RETRY_COUNT) {
      console.log('Превышено максимальное количество попыток переподключения, переключение на ручной режим');
      this.forceManualMode = true;
      if (onError) onError({ 
        message: 'Превышено максимальное количество попыток. Используются обычные запросы.' 
      });
      return;
    }
    
    // Экспоненциальная задержка: чем больше неудачных попыток, тем дольше задержка
    const delay = RETRY_TIMEOUT + (newCount * 2000);
    console.log(`Попытка переподключения SSE (${newCount}/${MAX_RETRY_COUNT}) через ${delay}мс...`);
    
    // Пробуем переподключиться через указанное время
    setTimeout(() => {
      // Если находимся в глобальной блокировке, пропускаем
      if (this.inGlobalCooldown) {
        console.log('Система в режиме глобальной блокировки, пропускаем отложенное переподключение');
        return;
      }
      
      // Еще раз проверяем, не был ли включен ручной режим за время ожидания
      if (this.forceManualMode) {
        console.log('Ручной режим был включен, пропускаем попытку переподключения');
        return;
      }
      
      if (connectionId === 'lobby_list') {
        this.connectToLobbyUpdates(onUpdate, onError);
      } else if (connectionId.startsWith('lobby_')) {
        const lobbyId = connectionId.replace('lobby_', '');
        this.connectToLobbyDetails(lobbyId, onUpdate, onError);
      }
    }, delay);
  }
  
  // Подключиться к SSE для обновления конкретного лобби
  connectToLobbyDetails(lobbyId: string, onLobbyUpdate: (lobby: any) => void, onError?: (error: any) => void): () => void {
    // Если находимся в глобальной блокировке, не пытаемся подключаться
    if (this.inGlobalCooldown) {
      console.log(`Система в режиме глобальной блокировки, пропускаем подключение к лобби ${lobbyId}`);
      if (onError) onError({ message: 'Система временно заблокирована. Повторите попытку через несколько секунд.' });
      return () => {};
    }
    
    // Проверяем, не было ли недавнего подключения
    const connectionId = `lobby_${lobbyId}`;
    const lastAttemptTime = this.connectionAttemptTime.get(connectionId) || 0;
    const now = Date.now();
    
    if (now - lastAttemptTime < RECONNECT_DELAY) {
      console.log(`Слишком частые попытки подключения к лобби ${lobbyId}, пропускаем`);
      // Возвращаем функцию закрытия существующего соединения, если оно есть
      return () => this.closeConnection(connectionId);
    }
    
    // Запоминаем время попытки
    this.connectionAttemptTime.set(connectionId, now);
    
    // Сбрасываем ручной режим при каждой попытке подключения
    this.manualMode = false;
    
    const token = authService.getToken();
    if (!token) {
      if (onError) onError({ message: 'Пользователь не авторизован' });
      return () => {};
    }
    
    // Закрываем существующее соединение, если оно есть
    this.closeConnection(connectionId);
    
    try {
      // Создаем URL с добавлением токена в параметры запроса
      const url = new URL(`${API_URL}/lobby/${lobbyId}/sse`);
      url.searchParams.append('token', token);
      
      // Добавляем случайный параметр для предотвращения кеширования
      url.searchParams.append('_', Date.now().toString());
      
      // Создаем новое SSE соединение
      const eventSource = new EventSource(url.toString());
      
      // Сохраняем соединение сразу
      this.connections.set(connectionId, eventSource);
      
      // Очищаем предыдущий таймер, если он существует
      if (this.connectionTimers.has(connectionId)) {
        clearTimeout(this.connectionTimers.get(connectionId));
      }
      
      // Установка таймаута для проверки открытия соединения
      const connectionTimeout = setTimeout(() => {
        console.error(`SSE соединение для лобби ${lobbyId} не установлено за отведенное время`);
        
        // Устанавливаем глобальную блокировку
        this.setGlobalCooldown();
        
        // Пробуем переподключиться
        if (this.connections.has(connectionId)) {
          this.retryConnection(connectionId, onLobbyUpdate, onError);
        }
        
        if (onError) onError({ message: 'Таймаут соединения, пробую переподключиться' });
      }, CONNECTION_TIMEOUT);
      
      // Сохраняем таймер для очистки позже
      this.connectionTimers.set(connectionId, connectionTimeout);
      
      // Регистрируем слушатели событий
      eventSource.onopen = () => {
        console.log(`SSE соединение для лобби ${lobbyId} установлено`);
        
        // Очищаем таймаут
        if (this.connectionTimers.has(connectionId)) {
          clearTimeout(this.connectionTimers.get(connectionId)!);
          this.connectionTimers.delete(connectionId);
        }
        
        // Сбрасываем счетчик повторных попыток при успешном подключении
        this.retryCount.set(connectionId, 0);
      };
      
      eventSource.addEventListener('lobby_update', (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`Получены обновления лобби ${lobbyId} через SSE:`, data);
          // Сбрасываем счетчик при успешном получении данных
          this.retryCount.set(connectionId, 0);
          onLobbyUpdate(data);
        } catch (error) {
          console.error('Ошибка при обработке данных SSE:', error);
          if (onError) onError(error);
        }
      });
      
      eventSource.onerror = (error) => {
        console.error(`Ошибка SSE соединения для лобби ${lobbyId}:`, error);
        
        // Устанавливаем глобальную блокировку
        this.setGlobalCooldown();
        
        // Очищаем таймаут, если он еще активен
        if (this.connectionTimers.has(connectionId)) {
          clearTimeout(this.connectionTimers.get(connectionId)!);
          this.connectionTimers.delete(connectionId);
        }
        
        // Сообщаем об ошибке для включения ручного обновления
        if (onError) onError(error);
        
        // Пробуем переподключиться только если соединение всё ещё в мапе
        if (this.connections.has(connectionId)) {
          this.retryConnection(connectionId, onLobbyUpdate, onError);
        }
      };
      
      // Возвращаем функцию для закрытия соединения
      return () => this.closeConnection(connectionId);
    } catch (error) {
      console.error(`Ошибка при создании SSE соединения для лобби ${lobbyId}:`, error);
      
      // Устанавливаем глобальную блокировку
      this.setGlobalCooldown();
      
      if (onError) onError(error);
      return () => {};
    }
  }
  
  // Сбросить ручной режим и попробовать снова использовать SSE
  resetManualMode(): void {
    this.manualMode = false;
    this.forceManualMode = false;
    this.retryCount.clear();
    this.connectionAttemptTime.clear();
    this.totalReconnectsThisSession = 0;
    this.inGlobalCooldown = false; // Сбрасываем глобальную блокировку
    if (this.globalCooldownTimer !== null) {
      clearTimeout(this.globalCooldownTimer);
      this.globalCooldownTimer = null;
    }
    console.log('Сброшен ручной режим, SSE будет использоваться при следующем подключении');
  }
  
  // Закрыть конкретное соединение
  closeConnection(connectionId: string): void {
    const eventSource = this.connections.get(connectionId);
    if (eventSource) {
      // Удаляем все обработчики событий перед закрытием
      eventSource.onopen = null;
      eventSource.onmessage = null;
      eventSource.onerror = null;
      
      // Пробуем/перехватываем ошибки при закрытии
      try {
        eventSource.close();
      } catch (e) {
        console.warn(`Ошибка при закрытии соединения ${connectionId}:`, e);
      }
      
      this.connections.delete(connectionId);
      console.log(`SSE соединение ${connectionId} закрыто`);
      
      // Сбрасываем флаг активного соединения
      if (connectionId === 'lobby_list') {
        this.hasActiveConnection = false;
      }
      
      // Устанавливаем глобальную блокировку
      this.setGlobalCooldown();
      
      // Очищаем таймеры, связанные с этим соединением
      if (this.connectionTimers.has(connectionId)) {
        clearTimeout(this.connectionTimers.get(connectionId)!);
        this.connectionTimers.delete(connectionId);
      }
    }
  }
  
  // Закрыть все соединения
  closeAllConnections(): void {
    // Создаем копию ключей, чтобы избежать проблем с изменением коллекции во время итерации
    const connectionIds = Array.from(this.connections.keys());
    
    for (const connectionId of connectionIds) {
      this.closeConnection(connectionId);
    }
    
    // Очищаем все оставшиеся таймеры
    this.connectionTimers.forEach((timer) => clearTimeout(timer));
    this.connectionTimers.clear();
    
    // Сбрасываем флаг активного соединения
    this.hasActiveConnection = false;
    
    // Устанавливаем глобальную блокировку
    this.setGlobalCooldown();
  }
  
  // Полностью сбросить состояние сервиса
  resetService(): void {
    this.closeAllConnections();
    this.manualMode = false;
    this.forceManualMode = false;
    this.retryCount.clear();
    this.connectionAttemptTime.clear();
    this.totalReconnectsThisSession = 0;
    this.hasActiveConnection = false;
    
    // Отключаем глобальную блокировку
    this.inGlobalCooldown = false;
    if (this.globalCooldownTimer !== null) {
      clearTimeout(this.globalCooldownTimer);
      this.globalCooldownTimer = null;
    }
    
    console.log('SSE сервис полностью сброшен');
  }
}

export const sseService = new SseService();