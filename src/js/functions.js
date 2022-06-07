function getDate(strDate) {
  let date = new Date(strDate);
  date = date.toLocaleString('ru');
  date = date.substr(0, 17).replace(',', '');
  return date;
}

function createLinks(text) {
  if (text === null || !text) {
    return text;
  }
  // протокол + домен + любой не пробельный символ
  const links = text.match(/(https?:\/\/)?([\w-]{1,32}\.[\w-]{1,32})[^\s@]*/igm);
  let modifiedText = text;
  if (links) {
    links.forEach((find) => {
      const replace = `<a href="${find}">${find}</a>`;
      modifiedText = text.replace(new RegExp(find, 'g'), replace);
    });
  }
  return modifiedText;
}

function getFile(file, type, fileName) {
  let content;

  if (type.match(/image/)) {
    content = document.createElement('img');
    content.classList.add('image');
    content.src = file;
  } else if (type.match(/video/)) {
    content = document.createElement('video');
    content.classList.add('video');
    content.controls = 'controls';
    content.src = file;
    content.textContent = fileName;
    content.download = fileName;
  } else if (type.match(/audio/)) {
    content = document.createElement('audio');
    content.classList.add('audio');
    content.controls = 'controls';
    content.src = file;
    content.textContent = fileName;
    content.download = fileName;
  } else {
    content = document.createElement('a');
    content.classList.add('file');
    content.href = file;
    content.textContent = fileName;
    content.download = fileName;
  }
  content.classList.add('media');
  content.dataset.name = fileName;
  return content;
}

export { getDate, createLinks, getFile };
