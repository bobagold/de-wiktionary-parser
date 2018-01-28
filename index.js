const {clean} = require('./clean_mediawiki');
const {prepareGame} = require('./prepare_game');

function url(titles) {
  return `https://de.wiktionary.org/w/api.php?action=query&titles=${titles}&prop=revisions&rvprop=content&format=json&formatversion=2`;
}

let fetch;
if (typeof window !== 'undefined') {
  let fetchCounter = 1;

  fetch = (url) => new Promise((resolve) => {
    const callback = `callMe${fetchCounter++}`;
    window[callback] = resolve;

    const tag = document.createElement('script');
    tag.src = `${url}&callback=${callback}`;
    document.body.appendChild(tag);
  });
} else {
  const nodeFetch = require('node-fetch');
  fetch = (url) => nodeFetch(url).then(res => res.json());
}

function urls(words) {
  const cnt = words.length;
  const ret = [];
  for (let i = 0; i < cnt / 50; i++) {
    const part = words.slice(i * 50, (i + 1) * 50);
    ret.push(url(part.join('|')));
  }
  return ret;
}

function processPages(pages, pos) {
  const ret = {};
  pages.filter(page => !page.missing && !page.invalid).forEach((page) => {
    const text = page.revisions[0].content;
    try {
      ret[page.title] = clean(text, pos);
    } catch (err) {
      console.error(err);
    }
  });
  return ret;
}

function make(words, pos) {
  return Promise.all(urls(words).map((url) => fetch(url).then(({query: {pages}}) => processPages(pages, pos))))
    .then(objects => Object.assign({}, ...objects))
    .then(prepareGame);
}

module.exports = {
  urls,
  fetch,
  processPages,
  prepareGame,
  make
};
