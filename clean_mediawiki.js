
function between(start, end) {
  let inBetween = false;
  return a => a.filter((s) => {
    if (s.match(start)) {
      inBetween = true;
      return false
    }
    if (s.match(end)) {
      inBetween = false;
    }
    return inBetween;
  });
}
function replace(pattern, replacement) {
  return a => a.map(s => s.replace(pattern, replacement));
}
function replaceAll(pattern, replacement) {
  return a => a.map(s => s.split(pattern).join(replacement));
}
function clean(pattern) {
  return replaceAll(pattern, '');
}
function chain(functions) {
  return (a) => {
    let res = a;
    functions.map((f) => {
      res = f(res);
    });
    return res;
  }
}
function having(pattern) {
  return a => a.filter(s => s.match(pattern));
}
function skip(pattern) {
  return a => a.filter(s => !s.match(pattern));
}
function only(pattern) {
  return a => a.map(s => (s.match(pattern) || []).join(', '));
}
function template(match) {
  const words = match.split('|');
  if (words[0] === 'K') {
    words.shift();
  }
  if (words[0] === 'Literatur ') {
    return '';
  }
  //https://de.wiktionary.org/wiki/Benutzer:Kronf/Glossar
  const s = {
    'trans.': 'transitiv',
    'intrans.': 'intransitiv',
    'refl.': 'reflexiv',
    mD: 'mit Dativ',
    'tlwvatd.': 'veraltend',
    'vatd.': 'veraltend',
    'va.': 'veraltet',
    'hist.': 'historisch',
    'landsch.': 'landschaftlich',
    'reg.': 'regional',
    'mdal.': 'mundartlich, dialektal',
    'geh.': 'gehoben',
    'bildungsspr.': 'bildungssprachlich',
    'ugs.': 'umgangssprachlich',
    'fam.': 'familiär',
    'volkst.': 'volkstümlich',
    'vul.': 'vulgär',
    'fachspr.': 'fachsprachlich',
    'dichter.': 'dichterisch',
    'poet.': 'poetisch',
    'abw.': 'abwertend',
    'euph.': 'euphemistisch',
    'fig.': 'figürlich',
    'bildl.': 'bildlich',
    'übertr.': 'übertragen',
    'meton.': 'metonymisch',
    'scherzh.': 'scherzhaft',
    'iron.': 'ironisch',
    'md.': 'mitteldeutsch',
    'nordd.': 'norddeutsch',
    'österr.': 'österreichisch',
    'schweiz.': 'schweizerisch',
    'südd.': 'süddeutsch',
  };
  return words.map(word => (s[word] || word.replace('ft=', ''))).join(', ').replace(/, (.)$/, '$1');
}

const end = /^({{\w+}})?$/;
const prefix = /^:+\[[^\]]*][ :]*/;
const templates = replace(/{{([^}]+)}}/g, (match, ...p) => template(...p));
const references = [
  replace(/<ref>.*<\/ref>/g, ''),
  replace(/<ref( name=\w+)\/>/g, ''),
  replace(/<ref>.*$/g, ''),
  replace(/^.*<\/ref>/g, ''),
];
const comments = replace(/<!-- .* -->/g, '');
const wikiLinks = replace(/\[\[[^\]]+\|([^\]]+)]]/, '$1');
const crossReferences = [prefix, '[[', ']]', '<small>', '</small>'].map(clean);
const fields = {
  forms: [
    between('{{Worttrennung}}', end),
    ...[/^:/, '[[', ']]', '{{Prät.}}', '{{Part.}}'].map(clean)
  ],
  meaning: [
    between('{{Bedeutungen}}', end),
    skip('{{QS Bedeutungen|fehlen}}'),
    ...references,
    comments,
    replaceAll('\'\'', '_'),
    replace(/<\/?sup>/g, ''),
    replace(/<\/?span>/g, ''),
    templates,
    ...crossReferences,
    having(/\w/)
  ],
  synonyms: [
    between('{{Synonyme}}', end),
    templates,
    wikiLinks,
    ...crossReferences
  ],
  examples: [
    between('{{Beispiele}}', end),
    skip('{{Beispiele fehlen}}'),
    ...references,
    comments,
    replaceAll('&nbsp;', ' '),
    replaceAll('&mdash;', '—'),
    replace(/<sup>.*<\/sup>/g, ''),
    ...[prefix, '<br />'].map(clean),
    replace(/\[\[w:[\w ]+\|([\w ]+)]], {{Wikisource\|([\w ]+)}}/, '$1, „$2“'),
    wikiLinks,
    replaceAll('\'\'', '_'),
  ],
  translations: [
    between('{{Übersetzungen}}', end),
    clean(/^:/),
    having('{{en}}'),
    only(/\|en\|([^|}]+)/g),
    clean('|en|'),
    having(/\w/)
  ]
};

exports.clean = function (html, pos) {
  const input = html.split('\n');
  let form = '';
  switch (pos) {
    case 'verb':
      form = 'Verb';
      break;
    case 'conjunction':
      form = '(Konjunktion|Subjunktion)';
      break;
    case 'noun':
      form = 'Substantiv';
      break;
    case 'adjective':
      form = 'Adjektiv';
      break;
    default:
      throw new Error(`unknown pos (part of speach): ${pos}`);
  }
  const interestingPart = between(new RegExp(`^=== .*{{Wortart\\|${form}\\|Deutsch}}`), /{{Referenzen}}/);
  const text = interestingPart(input);
  if (text.length === 0) {
    return {};
  }
  return Object.assign(...Object.keys(fields)
    .map(k => ({ [k]: chain(fields[k])(text) }))
  );
};
