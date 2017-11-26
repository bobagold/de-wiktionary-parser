const XmlStream = require('xml-stream');
const fs = require('fs');
const clean = require('./clean_mediawiki');

const stream = fs.createReadStream('/dev/stdin');
const xml = new XmlStream(stream);
const pos = process.argv[process.argv.length - 1];

xml.preserve('revision', true);
xml.on('endElement: page', function(page) {
  const text = page.revision.text.$children.join('');
  try {
    console.log(JSON.stringify({[page.title]: clean(text, pos)}));
  } catch (err) {
    console.error(err);
  }
});
