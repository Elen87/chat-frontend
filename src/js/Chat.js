import Modal from './Modal';
import WebSocketService from './WebSocketService';

export default class Chat {
  constructor(container) {
    this.container = container;
    this.wsService = new WebSocketService();
    this.currentUser = null;
    this.users = [];
    this.setupCallbacks();
  }

  setupCallbacks() {
    this.wsService.onMessage = (message) => {
      this.addMessageToUI(message);
    };
    
    this.wsService.onUsersUpdate = (users) => {
      this.users = users;
      this.updateUsersList();
    };
    
    this.wsService.onOpen = () => {
      console.log('Connected to server');
    };
    
    this.wsService.onClose = () => {
      this.showConnectionStatus('Соединение потеряно. Перезагрузите страницу.');
    };
    
    this.wsService.onError = (error) => {
      console.error('Connection error:', error);
      this.showConnectionStatus('Ошибка подключения к серверу');
    };
  }

  init() {
    this.showNicknameModal();
  }

  showNicknameModal() {
    const modal = new Modal({
      title: 'Выберите псевдоним',
      onSubmit: (nickname) => {
        this.registerUser(nickname);
      },
    });
    modal.show();
    this.currentModal = modal;
  }

  registerUser(nickname) {
    this.wsService.registerUser(nickname)
      .then(result => {
        if (result.status === 'ok') {
          this.currentUser = result.user;
          this.wsService.setCurrentUser(this.currentUser);
          this.wsService.connect();
          this.renderChatUI();
          if (this.currentModal) {
            this.currentModal.hide();
          }
        } else {
          if (this.currentModal) {
            this.currentModal.showError(result.message || 'Это имя уже занято!');
          }
        }
      })
      .catch(error => {
        console.error('Registration error:', error);
        if (this.currentModal) {
          this.currentModal.showError('Ошибка соединения с сервером');
        }
      });
  }

  renderChatUI() {
    this.container.innerHTML = '';
    
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';
    
    // Панель пользователей
    const usersPanel = document.createElement('div');
    usersPanel.className = 'users-panel';
    
    const usersHeader = document.createElement('div');
    usersHeader.className = 'users-header';
    usersHeader.textContent = 'Участники';
    
    this.usersList = document.createElement('div');
    this.usersList.className = 'users-list';
    
    usersPanel.appendChild(usersHeader);
    usersPanel.appendChild(this.usersList);
    
    // Основная область чата
    const chatMain = document.createElement('div');
    chatMain.className = 'chat-main';
    
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.textContent = `Чат • ${this.currentUser.name}`;
    
    this.messagesArea = document.createElement('div');
    this.messagesArea.className = 'messages-area';
    
    const inputArea = document.createElement('div');
    inputArea.className = 'input-area';
    
    this.messageInput = document.createElement('input');
    this.messageInput.type = 'text';
    this.messageInput.placeholder = 'Введите сообщение...';
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Отправить';
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    inputArea.appendChild(this.messageInput);
    inputArea.appendChild(sendBtn);
    
    chatMain.appendChild(chatHeader);
    chatMain.appendChild(this.messagesArea);
    chatMain.appendChild(inputArea);
    
    chatContainer.appendChild(usersPanel);
    chatContainer.appendChild(chatMain);
    
    this.container.appendChild(chatContainer);
    
    // Обработка закрытия страницы
    window.addEventListener('beforeunload', () => {
      this.wsService.exitUser();
    });
  }

  updateUsersList() {
    if (!this.usersList) return;
    
    this.usersList.innerHTML = '';
    this.users.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'user-item';
      if (user.id === this.currentUser?.id) {
        userItem.classList.add('active');
      }
      
      const statusDot = document.createElement('div');
      statusDot.className = 'user-status';
      
      const userName = document.createElement('div');
      userName.className = 'user-name';
      userName.textContent = user.name;
      
      userItem.appendChild(statusDot);
      userItem.appendChild(userName);
      this.usersList.appendChild(userItem);
    });
  }

  addMessageToUI(message) {
    if (!this.messagesArea) return;
    
    const isOwn = message.user.id === this.currentUser?.id;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'message-own' : 'message-other'}`;
    
    const time = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const date = new Date().toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    
    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';
    senderDiv.textContent = isOwn ? `You, ${time} ${date}` : `${message.user.name}, ${time} ${date}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = message.message;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = time;
    
    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(timeDiv);
    
    this.messagesArea.appendChild(messageDiv);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }

  sendMessage() {
    const text = this.messageInput.value.trim();
    if (text && this.currentUser) {
      this.wsService.sendMessage(text);
      this.messageInput.value = '';
      this.messageInput.focus();
    }
  }

  showConnectionStatus(message) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'connection-status';
    statusDiv.textContent = message;
    if (this.container) {
      this.container.insertBefore(statusDiv, this.container.firstChild);
      setTimeout(() => statusDiv.remove(), 3000);
    }
  }

  destroy() {
    this.wsService.exitUser();
    this.wsService.disconnect();
  }
}
