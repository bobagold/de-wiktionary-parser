const request = require('request');
const XmlStream = require('xml-stream');
const {clean} = require('./clean_mediawiki');
const {prepareGame} = require('./prepare_game');

function url(titles) {
  return `https://de.wiktionary.org/w/api.php?action=query&titles=${titles}&export=true&exportnowrap=true&format=json`;
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

function processStream(stream, pos) {
  const ret = {};
  const xml = new XmlStream(stream);
  xml.preserve('revision', true);
  xml.on('endElement: page', function (page) {
    const text = page.revision.text.$children.join('');
    try {
      ret[page.title] = clean(text, pos);
    } catch (err) {
      console.error(err);
    }
  });
  return new Promise((resolve) => xml.on('end', () => resolve(ret)));
}

function make(words, pos) {
  return Promise.all(urls(words).map((url) => processStream(request.get(url), pos)))
    .then(objects => Object.assign({}, ...objects))
    .then(prepareGame);
}

module.exports = {
  urls,
  processStream,
  prepareGame,
  make
};
