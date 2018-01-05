const XmlStream = require('xml-stream');
const fs = require('fs');
const clean = require('./clean_mediawiki');

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

const files = fs.readdirSync('data/');
['verb', 'conjunction', 'adjective', 'noun'].forEach((pos) => {
  Promise.all(
    files.filter((f) => f.includes(pos) && f.endsWith('.xml'))
      .map((f) => processStream(fs.createReadStream(`data/${f}`), pos))
  ).then(objects => Object.assign({}, ...objects)
  ).then(ret =>
    fs.writeFileSync(`data/${pos}.json`, JSON.stringify(ret))
  );
});
