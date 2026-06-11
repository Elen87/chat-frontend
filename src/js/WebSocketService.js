
const WS_URL = 'ws://localhost:3000';
const API_URL = 'http://localhost:3000';

export default class WebSocketService {
  constructor() {
    this.ws = null;
    this.onMessage = null;
    this.onUsersUpdate = null;
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;
    this.currentUser = null;
  }

  connect() {
    console.log(`Connecting to ${WS_URL}...`);
    this.ws = new WebSocket(WS_URL);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (this.onOpen) this.onOpen();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          if (this.onUsersUpdate) this.onUsersUpdate(data);
        } else {
          if (this.onMessage) this.onMessage(data);
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.onClose) this.onClose();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.onError) this.onError(error);
    };
  }

  disconnect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }

  async registerUser(name) {
    const response = await fetch(`${API_URL}/new-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
