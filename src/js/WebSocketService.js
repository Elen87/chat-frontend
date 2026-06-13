
const WS_URL = 'ws://localhost:3000';
const API_URL = 'http://localhost:3000';

export default class WebSocketService {
  constructor() {
    this.ws = null;
    this.currentUser = null;
    // Подписки на события
    this.onMessage = null;
    this.onUsersUpdate = null;
    this.onConnectionChange = null;
  }

  connect() {
    this.ws = new WebSocket(WS_URL);
    
    this.ws.onopen = () => {
      console.log('Connected to server');
      if (this.onConnectionChange) this.onConnectionChange(true);
    };
    
    this.ws.onmessage = (event) => {
      // 🔧 ФИКС: Проверяем тип данных перед парсингом
      let data;
      if (event.data instanceof Blob) {
        // Если пришёл Blob, преобразуем в строку
        const reader = new FileReader();
        reader.onload = () => {
          try {
            data = JSON.parse(reader.result);
            this.handleMessage(data);
          } catch (e) {
            console.error('Error parsing blob message:', e);
          }
        };
        reader.readAsText(event.data);
      } else if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('Error parsing message:', e);
        }
      } else {
        console.warn('Unknown message type:', typeof event.data);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from server');
      if (this.onConnectionChange) this.onConnectionChange(false);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.onConnectionChange) this.onConnectionChange(false);
    };
  }

  handleMessage(data) {
    if (Array.isArray(data)) {
      // Список пользователей
      if (this.onUsersUpdate) this.onUsersUpdate(data);
    } else if (data.type === 'send') {
      // Обычное сообщение
      if (this.onMessage) this.onMessage(data);
    }
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  async registerUser(name) {
    const response = await fetch(`${API_URL}/new-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  }

  sendMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentUser) {
      this.ws.send(JSON.stringify({
        type: 'send',
        message: message,
        user: {
          id: this.currentUser.id,
          name: this.currentUser.name,
        },
      }));
    }
  }

  exitUser() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentUser) {
      this.ws.send(JSON.stringify({
        type: 'exit',
        user: {
          id: this.currentUser.id,
          name: this.currentUser.name,
        },
      }));
    }
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}
