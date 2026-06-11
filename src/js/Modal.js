export default class Modal {
  constructor(options = {}) {
    this.title = options.title || 'Вход в чат';
    this.onSubmit = options.onSubmit || (() => {});
    this.element = null;
  }

  show() {
    this.remove();
    this.element = this.createModal();
    document.body.appendChild(this.element);
    const input = this.element.querySelector('input');
    if (input) input.focus();
  }

  hide() {
    this.remove();
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  showError(message) {
    const errorDiv = this.element.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
    }
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    
    const title = document.createElement('h2');
    title.textContent = this.title;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Введите ваш никнейм';
    input.id = 'nickname-input';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    const button = document.createElement('button');
    button.textContent = 'Продолжить';
    button.addEventListener('click', () => {
      const nickname = input.value.trim();
      if (nickname) {
        this.onSubmit(nickname);
      } else {
        this.showError('Пожалуйста, введите никнейм');
      }
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const nickname = input.value.trim();
        if (nickname) {
          this.onSubmit(nickname);
        }
      }
    });
    
    content.appendChild(title);
    content.appendChild(input);
    content.appendChild(errorDiv);
    content.appendChild(button);
    modal.appendChild(content);
    
    // Закрытие при клике вне окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        // Не закрываем, ждём ввода
      }
    });
    
    return modal;
  }
}
