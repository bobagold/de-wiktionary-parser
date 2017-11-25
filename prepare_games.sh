test -d games || mkdir games
for pos in verb noun adjective conjunction; do
    bash prepare_game.sh "$pos" > "games/$pos.json";
done
