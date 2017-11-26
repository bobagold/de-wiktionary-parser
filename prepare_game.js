Object.keys(data).map((v) => {
  const w = data[v];
  const ee = w.examples && w.examples.filter(e => e.includes('_'));
  const e = ee && ee[Math.floor(Math.random() * ee.length)];
  return e && [v, e.replace(/_.+?_/g, '_🤷_'), e, '_Bedeutung_', ...w.meaning, '🇬🇧', ...w.translations];
}).filter(Boolean);
