/* eslint-disable prefer-destructuring */
export default class Modal {
  showModal() {
    this.createModal();
    document.body.appendChild(this.modal);

    this.buttonOk = this.modal.querySelector('.button-ok');
    this.buttonOk.addEventListener('click', this.onCancel);

    // this.buttoncancel = this.modal.querySelector('.button-cancel');
    // this.buttoncancel.addEventListener('click', this.onCancel);
  }

  onCancel(event) {
    event.preventDefault();
    let { modal } = this.modal;
    document.body.removeChild(modal);
    modal = null;
    this.geoToggle();
  }

  // onSaveCoord(event) {
  //   event.preventDefault();
  //   let { modal } = this.modal;

  //   const formText = modal.querySelector('.form__text');
  //   this.coord = formText.value;
  //   const checkFormat = this.modal.checkFormat(this.coord);

  //   if (!checkFormat) {
  //     const warning = modal.querySelector('.warning');
  //     warning.textContent = this.warning;
  //     formText.style.background = '#dba1a1';
  //     setTimeout(() => {
  //       warning.textContent = '';
  //     }, 2000);
  //     return;
  //   }

  //   this.createTextPost();
  //   document.body.removeChild(modal);
  //   modal = null;
  // }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.classList.add('modal');

    this.modal.innerHTML = `
      <div class="modal__wrapper">
        <div class="modal__content">
          <h3 class="modal__title">Что-то пошло не так</h3>
          <p class="modal__text">К сожалению, нам не удалось определить ваше местоположение, пожалуйста, дайте разрешение наиспользование геолокации или добавьте запись без геопозиции</p>
           <button class="form__button button button-ok">ok</button>
        </div>
      </div>
      `;
  }
}
