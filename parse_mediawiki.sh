function clean() {
    i="$1"
    pos="$2"
}

for pos in verb noun adjective conjunction; do
    for i in data/"$pos"*.xml; do
        cat "$i" | node parse_mediawiki.js "$pos"
    done | json --merge > "data/$pos.json"
done
