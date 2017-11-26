test -d games || mkdir games
for pos in verb noun adjective conjunction; do
    cat "data/$pos.json" | json -e "const data = this; this.e = $(cat prepare_game.js)" e > "games/$pos.json";
done
