
export default class UsersList {
  constructor(container) {
    this.container = container;
    this.users = [];
    this.currentUserId = null;
  }

  setCurrentUserId(id) {
    this.currentUserId = id;
    this.render();
  }

  updateUsers(users) {
    this.users = users;
    this.render();
  }

  render() {
    if (!this.container) return;
    
    this.container.innerHTML = '';
    this.users.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'user-item';
      if (user.id === this.currentUserId) {
        userItem.classList.add('active');
      }
      
      const statusDot = document.createElement('div');
      statusDot.className = 'user-status';
      
      const userName = document.createElement('div');
      userName.className = 'user-name';
      userName.textContent = user.name;
      
      userItem.appendChild(statusDot);
      userItem.appendChild(userName);
      this.container.appendChild(userItem);
    });
  }
}
