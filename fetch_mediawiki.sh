function get() {
    curl -s "https://de.wiktionary.org/w/api.php?action=query&titles=$1&export=true&exportnowrap=true&format=json"
}
for pos in verb conjunction adjective noun; do
    test -d "pos" || mkdir "$pos"
    cat "$pos.txt" | while read i; do
        get "$i" > "$pos/$i.xml"
        echo -n .
        sleep 1
    done
done
