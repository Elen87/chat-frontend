
import './css/style.css';
import Chat from './js/Chat';
import WebSocketService from './js/WebSocketService';

// Инициализация зависимостей на верхнем уровне
const appContainer = document.getElementById('app');
const wsService = new WebSocketService();
const chat = new Chat(appContainer, wsService);

chat.init();

// Обработка закрытия страницы
window.addEventListener('beforeunload', () => {
  chat.destroy();
})
