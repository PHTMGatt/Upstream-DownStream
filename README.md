# Eminem A–Z Practice

A one-file web app for practicing an A–Z song-recall game: pick a letter, name an Eminem song that starts with it, and track
your score.

## What it does

- **Browse** tab: pick a letter to see its accepted song titles and the album each one is from. Tapping a title locks it in as your pick.
- **Test** tab: you are shown a letter and answer by voice (the browser's Web Speech API, where available) or by typing a title. You can reveal the songs or mark the letter as missed, then move to the next letter.
- **Score** out of 24: the house rule crosses out **Q** and **X** (no entries), so 24 letters count.
- Progress is saved in the browser (`localStorage`, key `eminemAZState`); the Reset button clears the run.

## Run it

Requires Node.js 18 or newer. There are no dependencies.

```
npm start        # node server.js, listens on PORT (default 3000)
```

Open `http://localhost:3000`. `GET /health` returns `ok`.

## How it is built

`server.js` is the whole project: a plain Node `http` server that returns one HTML page with the styles, the catalog (an object
mapping each letter to `[title, album]` pairs) and the game script embedded. There is no framework and no build step.
Voice input depends on the browser; where speech recognition is unavailable the mic button is disabled and typing still works.

## Notes

The song catalog is a hand-made practice list and is not guaranteed to be complete.
