export default class Emoji {
  constructor(element) {
    this.element = element;
    this.emoji = ['💜', '💙', '💖', '😂', '😁', '😃', '😄', '🤣', '😅', '😆', '😇', '😉', '😊', '🙂', '🙃', '😋', '😌', '😍', '🥰', '😘', '😗', '😚', '😜', '😝', '😛', '🤑', '😶', '👍', '👎', '🔥'];
  }

  showList() {
    if (this.element.querySelector('.emoji-list')) {
      return;
    }
    this.first = true;
    const list = document.createElement('div');
    list.classList.add('emoji-list');
    this.emoji.emoji.forEach((smile) => {
      list.innerHTML += `<span class="emoji">${smile}</span>`;
    });
    this.element.appendChild(list);
    const btnCoordinate = this.emojiBtn.getBoundingClientRect();
    const listSize = list.getBoundingClientRect();
    const top = btnCoordinate.top - listSize.height - 3;
    const left = btnCoordinate.left - listSize.width / 2 + btnCoordinate.width / 2;
    list.style.top = `${top}px`;
    list.style.left = `${left}px`;
    this.element.addEventListener('click', this.emoji.close);
    list.addEventListener('click', this.emoji.addEmoji);
  }

  addEmoji(event) {
    if (!event.target.closest('.emoji')) {
      return;
    }
    const emoji = event.target.closest('.emoji').textContent;
    this.textArea.value += ` ${emoji} `;
  }

  close(event) {
    if (event.target.closest('.emoji-list')) {
      return;
    }
    const list = this.element.querySelector('.emoji-list');
    if (!list) {
      return;
    }
    if (event.target.closest('.chaos-control__create-post-emoji') && this.first === true) {
      this.first = false;
      return;
    }
    this.element.removeChild(list);
    this.element.removeEventListener('click', this.emoji.close);
    list.removeEventListener('click', this.emoji.addEmoji);
  }
}
