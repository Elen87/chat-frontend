
import WebSocketService from './WebSocketService';
import MessageList from './MessageList';
import UsersList from './UsersList';
import MessageForm from './MessageForm';
import Modal from './Modal';

export default class Chat {
  constructor(container, wsService) {
    this.container = container;
    this.wsService = wsService;
    this.messageList = null;
    this.usersList = null;
    this.messageForm = null;
    this.currentUser = null;
    
    // Подписываемся на события WebSocket
    this.wsService.onMessage = this.handleNewMessage.bind(this);
    this.wsService.onUsersUpdate = this.handleUsersUpdate.bind(this);
  }

  init() {
    this.showNicknameModal();
  }

  showNicknameModal() {
    const modal = new Modal({
      title: 'Выберите псевдоним',
      onSubmit: (nickname) => this.registerUser(nickname),
    });
    modal.show();
    this.modal = modal;
  }

  async registerUser(nickname) {
    try {
      const result = await this.wsService.registerUser(nickname);
      if (result.status === 'ok') {
        this.currentUser = result.user;
        this.wsService.setCurrentUser(this.currentUser);
        this.wsService.connect();
        this.renderChatUI();
        this.modal.hide();
      } else {
        this.modal.showError(result.message || 'Это имя уже занято!');
      }
    } catch (error) {
      this.modal.showError('Ошибка соединения с сервером');
    }
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
    
    const usersListContainer = document.createElement('div');
    usersListContainer.className = 'users-list';
    
    usersPanel.appendChild(usersHeader);
    usersPanel.appendChild(usersListContainer);
    
    // Основная область чата
    const chatMain = document.createElement('div');
    chatMain.className = 'chat-main';
    
    const chatHeader = document.createElement('div');
    chatHeader.className = 'chat-header';
    chatHeader.textContent = `Чат • ${this.currentUser.name}`;
    
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-area';
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-area-placeholder';
    
    chatMain.appendChild(chatHeader);
    chatMain.appendChild(messagesContainer);
    chatMain.appendChild(inputContainer);
    
    chatContainer.appendChild(usersPanel);
    chatContainer.appendChild(chatMain);
    this.container.appendChild(chatContainer);
    
    // Инициализация компонентов
    this.messageList = new MessageList(messagesContainer);
    this.messageList.setCurrentUser(this.currentUser);
    
    this.usersList = new UsersList(usersListContainer);
    this.usersList.setCurrentUserId(this.currentUser.id);
    
    this.messageForm = new MessageForm(inputContainer, (text) => {
      this.wsService.sendMessage(text);
    });
    
    this.messageForm.focus();
  }

  handleNewMessage(message) {
    if (this.messageList) {
      this.messageList.addMessage(message);
    }
  }

  handleUsersUpdate(users) {
    if (this.usersList) {
      this.usersList.updateUsers(users);
    }
  }

  destroy() {
    this.wsService.exitUser();
    this.wsService.disconnect();
  }
}
