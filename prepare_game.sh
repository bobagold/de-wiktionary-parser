for i in "$1"/*.json; do
    v=$(basename $i .json);
    cat $i  | json -e "
    const ee = this.examples && this.examples.filter(e => e.includes('_'))
    const e = ee && ee[Math.floor(Math.random() * ee.length)]
    this.e = e && {'$v': [e.replace(/_.+?_/g, '_🤷_'), e, '_Bedeutung_', ...this.meaning, '🇬🇧', ...this.translations]}
    " e;
done | json --merge | json -e 'this.k = Object.keys(this).map(k => [k, ...this[k]])' k
