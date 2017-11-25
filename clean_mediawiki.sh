function clean() {
    i="$1"
    pos="$2"
    fields="${3:-forms meaning synonyms translations examples}"
    j="${i/\.xml/.json}"
    cat "$i" | node clean_mediawiki.js "$pos" > "$j"
    cat "$j" | json ${fields} | grep -vxF '[]' | json -ga > "${i/\.xml/.txt}"
}

for pos in verb noun adjective conjunction; do
    for i in "$pos"/*.xml; do
        clean "$i" "$pos"
    done
done
