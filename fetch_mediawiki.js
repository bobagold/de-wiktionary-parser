const request = require('request');
const fs = require('fs');

function get(titles) {
    return request.get(`https://de.wiktionary.org/w/api.php?action=query&titles=${titles}&export=true&exportnowrap=true&format=json`);
}
fs.existsSync('data') || fs.mkdirSync('data');
['verb', 'conjunction', 'adjective', 'noun'].forEach((pos) => {
    const lines = fs.readFileSync(`${pos}.txt`, 'utf8').split('\n');
    const cnt = lines.length;
    for (let i = 0; i <= cnt / 50; i++) {
        const part = lines.slice(i * 50, (i + 1) * 50);
        if (part.length) {
          const fileName = `data/${pos}${i}.xml`;
          const tmpFileName = `${fileName}.tmp`;
          get(part.join('|'))
              .on('error', () => fs.unlink(tmpFileName))
              .on('complete', () => fs.rename(tmpFileName, fileName))
              .pipe(fs.createWriteStream(tmpFileName));
            //todo sleep 1
        }
    }
});
