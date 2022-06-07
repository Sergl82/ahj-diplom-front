export default class PinPost {
  onPinPost(event) {
    const post = event.target.closest('.post');
    this.pinPost(post.dataset.id);
  }

  pinPost(id) {
    this.ws.send(JSON.stringify({
      event: 'pinPost',
      message: id,
    }));
  }

  drawPin() {
    if (this.element.querySelector('.chaos-pin')) {
      return;
    }
    const pinedPost = document.createElement('div');
    pinedPost.classList.add('chaos-pin');
    pinedPost.classList.add('icon');
    const header = this.element.querySelector('.chaos-header');
    header.append(pinedPost);
    pinedPost.addEventListener('click', this.goToPost);
  }

  removePin() {
    const pinedPost = this.element.querySelector('.chaos-pin');
    if (!pinedPost) {
      return;
    }
    const header = this.element.querySelector('.chaos-header');
    pinedPost.removeEventListener('click', this.goToPost);
    header.removeChild(pinedPost);
  }

  goToPost() {
    const pinedPost = this.feed.querySelector(`[data-id="${this.pinId}"]`);
    if (!pinedPost) {
      this.feed.scroll(0, 0);
      this.getPinPost();
      return;
    }
    const { top } = pinedPost.getBoundingClientRect();
    const relativeTop = this.feed.getBoundingClientRect().top;
    this.feed.scrollBy(0, top - relativeTop - 10);
  }

  getPinPost() {
    this.ws.send(JSON.stringify({
      event: 'getPost',
      message: this.pinId,
    }));
  }

  checkPinPost() {
    const lastPin = this.feed.querySelector('.pined');
    if (lastPin) {
      lastPin.classList.remove('pined');
      this.removePin();
    }
    if (!this.pinId) {
      return;
    }
    const newPin = this.feed.querySelector(`[data-id="${this.pinId}"]`);
    if (newPin) {
      newPin.classList.add('pined');
    }
    this.drawPin();
  }

  addPinPost(post) {
    const postPin = this.markupОfThePost(post);
    this.feed.insertBefore(postPin, this.feed.firstElementChild);
    setTimeout(() => {
      this.feed.removeChild(postPin);
    }, 5000);
  }
}
