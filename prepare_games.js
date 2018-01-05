const fs = require('fs');
const {prepareGame} = require('./prepare_game');
fs.existsSync('games') || fs.mkdirSync('games');
['verb', 'conjunction', 'adjective', 'noun'].forEach((pos) => {
  fs.writeFile(`games/${pos}.json`, JSON.stringify(prepareGame(require(`./data/${pos}.json`))));
});
