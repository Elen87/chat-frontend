
export default class MessageForm {
  constructor(container, onSend) {
    this.container = container;
    this.onSend = onSend;
    this.input = null;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    
    const form = document.createElement('div');
    form.className = 'input-area';
    
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Введите сообщение...';
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.send();
      }
    });
    
    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Отправить';
    sendBtn.addEventListener('click', () => this.send());
    
    form.appendChild(this.input);
    form.appendChild(sendBtn);
    this.container.appendChild(form);
  }

  send() {
    const text = this.input.value.trim();
    if (text) {
      this.onSend(text);
      this.input.value = '';
      this.input.focus();
    }
  }

  focus() {
    if (this.input) this.input.focus();
  }
}
