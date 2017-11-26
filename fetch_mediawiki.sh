#!/usr/bin/env bash
function get() {
    curl -s "https://de.wiktionary.org/w/api.php?action=query&titles=$1&export=true&exportnowrap=true&format=json"
}
test -d "data" || mkdir "data"
for pos in verb conjunction adjective noun; do
    cnt=$(cat "$pos.txt" | wc -l)
    for ((i = 0; i <= $((cnt / 50)); i++)); do
        part=$(cat "$pos.txt" | tail -n +$((i * 50 + 1)) | head -n 50)
        if [ $(wc -l <<< "$part") -gt 0 ]; then
            get $(echo "$part" | tr '\n' '|') > "data/$pos$i.xml"
            echo -n .
            sleep 1
        fi
    done
done
