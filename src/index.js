import './css/style.css';
import Chat from './js/Chat';

const appContainer = document.getElementById('app');
const chat = new Chat(appContainer);
chat.init();

// Обработка закрытия страницы
window.addEventListener('beforeunload', () => {
  chat.destroy();
})
