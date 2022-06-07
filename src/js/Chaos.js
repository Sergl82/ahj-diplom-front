import Modal from './Madal';
import PinPost from './PinPost';
import Emoji from './Emoji';
import { getDate, createLinks, getFile } from './functions';

export default class Chaos {
  constructor(elem) {
    if (typeof elem === 'string') {
      // eslint-disable-next-line no-param-reassign
      elem = document.querySelector(elem);
    }
    this.element = elem;

    this.server = 'wss://ahj-diplom-heroku.herokuapp.com/ws';
    // this.server = 'ws://localhost:7070/ws';

    this.feed = this.element.querySelector('.chaos-content');
    this.emojiBtn = this.element.querySelector('.chaos-control__create-post-emoji');
    this.textArea = this.element.querySelector('.chaos-control__create-post-text');
    this.geoBtn = this.element.querySelector('.chaos-control__create-post-geo');
    this.addFileBtn = this.element.querySelector('.chaos-control__create-post-add');
    this.fileInput = this.element.querySelector('.file-input');
    this.dragArea = this.element.querySelector('.drag__area');

    this.geoStatus = true;
    this.modal = new Modal();
    this.emoji = new Emoji();
    this.pin = new PinPost();

    this.geoToggle = this.geoToggle.bind(this);
    this.drag = this.drag.bind(this);

    this.onPinPost = this.pin.onPinPost.bind(this);
    this.checkPinPost = this.pin.checkPinPost.bind(this);
    this.goToPost = this.pin.goToPost.bind(this);
    this.pinPost = this.pin.pinPost.bind(this);
    this.drawPin = this.pin.drawPin.bind(this);
    this.removePin = this.pin.removePin.bind(this);
    this.getPinPost = this.pin.getPinPost.bind(this);
    this.addPinPost = this.pin.addPinPost.bind(this);

    this.emoji.showList = this.emoji.showList.bind(this);
    this.emoji.close = this.emoji.close.bind(this);
    this.emoji.addEmoji = this.emoji.addEmoji.bind(this);

    this.modal.showModal = this.modal.showModal.bind(this.modal);
    this.modal.createModal = this.modal.createModal.bind(this.modal);
    this.modal.onCancel = this.modal.onCancel.bind(this);
  }

  init() {
    this.geo();
    this.textArea.addEventListener('keydown', this.onCreatePost.bind(this));

    this.geoBtn.addEventListener('click', this.geoToggle);
    this.emojiBtn.addEventListener('click', this.emoji.showList);
    this.addFileBtn.addEventListener('click', this.addFile.bind(this));

    this.feed.addEventListener('scroll', this.populate.bind(this));
    this.feed.addEventListener('mouseover', this.onMouseOver.bind(this));
    this.feed.addEventListener('mouseout', this.onMouseOut.bind(this));

    document.addEventListener('dragover', this.drag);
    this.dragArea.addEventListener('drop', this.drag);
    this.onStart();
  }

  onStart() {
    this.ws = new WebSocket(this.server);
    this.ws.addEventListener('open', () => {
      this.ws.send(JSON.stringify({
        event: 'connected',
        message: this.element,
      }));
    });

    this.ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.event === 'connected') {
        this.pinId = msg.message.pinId;
        this.renderPosts(msg.message.posts);
        this.checkPinPost();
        return;
      }
      if (msg.event === 'newPost') {
        this.newPost(msg.post);
        return;
      }
      if (msg.event === 'morePosts') {
        this.renderPreviosPosts(msg.posts);
        return;
      }
      if (msg.event === 'pinPost') {
        this.pinId = msg.id;
        this.checkPinPost();
        return;
      }
      if (msg.event === 'deletePost') {
        if (msg.id === this.pinId) {
          this.pinId = null;
          this.checkPinPost();
        }
        this.deletePostToDOM(msg.id);
        return;
      }
      if (msg.event === 'getPost') {
        this.addPinPost(msg.post);
      }
    });
  }

  addFile() {
    this.fileInput.dispatchEvent(new MouseEvent('click'));
    this.fileInput.addEventListener('change', (event) => {
      const { target } = event;
      const file = target.files.item(0);
      this.sendFile(file);
      this.fileInput.value = '';
    });
  }

  sendFile(file) {
    if (!file) return;
    let fileFormated = null;
    const fileType = file.type;

    const fr = new FileReader();
    fr.readAsDataURL(file);

    let geo = '';
    if (this.geoStatus === true) {
      this.geo();
      geo = `[${this.latitude}, ${this.longitude}]`;
    }
    if (!this.latitude && this.geoStatus) {
      this.modal.showModal();
      return;
    }

    fr.onload = () => {
      fileFormated = fr.result;
      const data = {
        text: null,
        geoStatus: this.geoStatus,
        geo,
        file: fileFormated,
        type: fileType,
        fileName: file.name,
      };

      this.sendMsg(data);
    };
  }

  drag(event) {
    const { type } = event;
    event.preventDefault();
    const dragWrapper = this.dragArea.parentElement;
    if (type === 'dragover') {
      dragWrapper.classList.remove('hidden');
      dragWrapper.addEventListener('dragleave', this.drag);
      return;
    }

    if (type === 'dragleave') {
      dragWrapper.removeEventListener('dragleave', this.drag);
      dragWrapper.classList.add('hidden');
      return;
    }

    if (type === 'drop') {
      dragWrapper.removeEventListener('dragleave', this.drag);
      dragWrapper.classList.add('hidden');
      const file = event.dataTransfer.files[0];
      this.sendFile(file);
    }
  }

  newPost(data) {
    const post = this.markupОfThePost(data);
    this.feed.insertBefore(post, this.feed.firstElementChild);
  }

  markupОfThePost(data) {
    const {
      text, geoStatus, geo, file, type, fileName, date, id,
    } = data;
    const formattedDate = getDate(date);
    const post = document.createElement('div');
    post.classList.add('post');
    post.dataset.id = id;
    let content;

    if (text !== null) {
      const textAndLink = createLinks(text);
      content = document.createElement('div');
      content.classList.add('post-text');
      content.innerHTML = textAndLink;
    }

    if (file) {
      post.classList.add('download');
      content = getFile(file, type, fileName);
    }

    post.innerHTML = `
    <div class="post-date">${formattedDate}</div>`;
    post.append(content);
    post.innerHTML += `<div class="post-geolacation">${geo} 
    <div class="geo"></div>
    </div>`;
    if (geoStatus === false) {
      const el = post.querySelector('.geo');
      el.classList.add('hidden');
    }
    if (id === this.pinId) {
      post.classList.add('pined');
    }
    return post;
  }

  onCreatePost(event) {
    const text = this.textArea.value.trim();
    if (!(event.key === 'Enter' && text)) return;
    event.preventDefault();
    let geo = '';
    if (this.geoStatus === true) {
      this.geo();
      geo = `[${this.latitude}, ${this.longitude}]`;
    }
    if (!this.latitude && this.geoStatus) {
      this.modal.showModal();
      return;
    }
    const data = {
      text,
      geoStatus: this.geoStatus,
      geo,
    };
    this.sendMsg(data);
    this.textArea.value = '';
  }

  renderPosts(posts) {
    posts.forEach((post) => {
      this.newPost(post);
    });

    this.checkPinPost();
  }

  renderPreviosPosts(posts) {
    const reversePosts = posts.reverse();
    reversePosts.forEach((post) => {
      const previosPost = this.markupОfThePost(post);
      this.feed.append(previosPost);
    });
  }

  populate() {
    const lastPost = this.feed.lastChild;
    const { id } = lastPost.dataset;
    const relativeBottom = lastPost.getBoundingClientRect().bottom;
    if (relativeBottom > this.feed.clientHeight + 50) return;
    this.getMore(id);
  }

  getMore(id) {
    if (this.lastId === id) return;
    this.ws.send(JSON.stringify({
      event: 'getMore',
      message: id,
    }));
    this.lastId = id;
  }

  sendMsg(data) {
    const {
      text, geoStatus, geo, file, type, fileName,
    } = data;
    this.ws.send(JSON.stringify({
      event: 'newPost',
      message: text || null,
      geoStatus,
      geo,
      type,
      file,
      fileName,
    }));
  }

  geoToggle() {
    this.geoBtn.classList.toggle('on');
    this.geoBtn.classList.toggle('off');
    if (this.geoStatus === true) {
      this.geoStatus = false;
      return;
    }
    this.geoStatus = true;
  }

  geo() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude.toFixed(4);
          this.longitude = position.coords.longitude.toFixed(4);
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.log(`определить позицию не удалось. Ошибка: ${error}`);
        },
      );
    }
  }

  onMouseOver(event) {
    if (!event.target.closest('.post')) {
      return;
    }
    const post = event.target.closest('.post');
    this.post = post;
    if (post.querySelector('.clip')) {
      return;
    }
    const clipPost = document.createElement('div');
    clipPost.classList.add('clip');
    clipPost.classList.add('icon');
    const deletePost = document.createElement('div');
    deletePost.classList.add('delete');
    deletePost.classList.add('icon');
    if (post.classList.contains('download')) {
      const download = document.createElement('div');
      download.classList.add('download-file');
      download.classList.add('icon');
      post.insertBefore(download, post.firstElementChild);
      download.addEventListener('click', this.onDownload);
    }
    post.insertBefore(clipPost, post.firstElementChild);
    post.insertBefore(deletePost, post.firstElementChild);

    clipPost.addEventListener('click', this.onPinPost);
    deletePost.addEventListener('click', this.onDeletePost.bind(this));
  }

  onMouseOut(event) {
    if (!event.relatedTarget) {
      return;
    }
    const post = event.relatedTarget.closest('.post');
    if (post === this.post || !this.post) {
      return;
    }
    const clipPost = this.post.querySelector('.clip');
    const deletePost = this.post.querySelector('.delete');
    const download = this.post.querySelector('.download-file');

    clipPost.removeEventListener('click', this.onPinPost);
    deletePost.removeEventListener('click', this.onDeletePost.bind(this));
    this.post.removeChild(clipPost);
    this.post.removeChild(deletePost);
    if (download) {
      download.removeEventListener('click', this.onDownload);
      this.post.removeChild(download);
    }
    this.post = null;
  }

  // eslint-disable-next-line class-methods-use-this
  onDownload(event) {
    const post = event.target.closest('.post');
    const mediaContent = post.querySelector('.media');
    const link = document.createElement('a');
    link.href = mediaContent.src || mediaContent.href;
    link.download = mediaContent.dataset.name;
    link.click();
  }

  onDeletePost(event) {
    const post = event.target.closest('.post');
    this.deletePost(post.dataset.id);
  }

  deletePost(id) {
    this.ws.send(JSON.stringify({
      event: 'deletePost',
      message: id,
    }));
  }

  deletePostToDOM(id) {
    const post = this.feed.querySelector(`[data-id="${id}"]`);
    this.feed.removeChild(post);
  }
}
