# VocabMaster — SSC & Railway Vocabulary Trainer

A lightweight, mobile-first vocabulary web app for SSC and Railway exam aspirants. Pure HTML/CSS/JS — no build step, no framework, no backend. Loads everything from `data.json` via `fetch()`.

## Files

```
vocab-app/
├── index.html      # App shell + all 3 screens (PYQ Master, Flashcard Vault, Quiz Arena)
├── style.css       # Orange-themed, mobile-first styling
├── script.js       # All app logic (fetch, navigation, flashcards, quiz engine)
├── data.json       # The word bank — 50 starter entries (20 are PYQ-tagged)
└── README.md       # This file
```

## Running it locally

Browsers block `fetch()` on the `file://` protocol, so don't just double-click `index.html`. Serve the folder instead:

```bash
# Option A: Python (built into most systems)
cd vocab-app
python3 -m http.server 8000
# then open http://localhost:8000

# Option B: Node
npx serve .

# Option C: VS Code "Live Server" extension
```

## Hosting on GitHub Pages

1. Create a new GitHub repo (e.g. `vocab-master`) and push these files to the root (or to a `/docs` folder).
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**, branch: `main`, folder: `/ (root)` (or `/docs` if you used that).
4. Save. Your app will be live at `https://<your-username>.github.io/vocab-master/` within a minute or two.
5. No build step is needed — it's static HTML/CSS/JS, so GitHub Pages serves it directly.

That's it. Every time you `git push` an updated `data.json`, the live site updates automatically.

## Data schema

Each entry in the `words` array of `data.json` looks like this:

```json
{
  "id": 51,
  "word": "Benevolent",
  "meaning": "Kind and generous; well-meaning",
  "trick": "BEN-EVOL-ENT sounds like 'good-evolved-entity' — someone who evolved to be kind.",
  "synonym": "Charitable",
  "antonym": "Malevolent",
  "examples": [
    "The benevolent donor funded the entire school renovation.",
    "She is known for her benevolent attitude towards stray animals."
  ],
  "isRepeated": false,
  "examTag": ""
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | number | ✅ | Must be unique across the whole file. Just keep incrementing. |
| `word` | string | ✅ | The vocabulary word itself. |
| `meaning` | string | ✅ | One clear definition. Used as the "correct answer" in Quiz Arena. |
| `trick` | string | ✅ | A mnemonic/memory trick. Shown in Flashcard Vault and as the quiz explanation. |
| `synonym` | string | optional | Shown on the flashcard back. Use `""` if none. |
| `antonym` | string | optional | Shown on the flashcard back. Use `""` if none. |
| `examples` | array of strings | ✅ | At least 2 real-life usage sentences (Quiz Arena shows the first 2). |
| `isRepeated` | boolean | ✅ | Set to `true` only if this word has actually appeared in a previous SSC/Railway paper. Controls the **PYQ Master** filter. |
| `examTag` | string | optional | e.g. `"SSC CGL 2021"`. Shown as a badge on PYQ cards. Use `""` if `isRepeated` is `false`. |

## Appending more words (scaling up to 2,000)

The app was built so you can keep growing `data.json` indefinitely without touching `index.html`, `style.css`, or `script.js`. Nothing in the code assumes a fixed word count — `script.js` always reads `state.allWords.length` dynamically.

To add more words:

1. Open `data.json`.
2. Find the closing `]` of the `words` array.
3. Add a comma after the last existing entry, then paste your new entry/entries using the schema above.
4. Make sure every new `id` is unique (highest current id + 1, +2, …).
5. Save and refresh the browser (or re-deploy on GitHub Pages).

**Tips for scaling to hundreds/thousands of words:**

- **Validate as you go.** Before committing, run this quick check (Node.js) to catch typos/duplicate ids/missing fields early:

  ```bash
  node -e "
    const d = require('./data.json');
    const ids = new Set();
    let problems = 0;
    d.words.forEach(w => {
      if (ids.has(w.id)) { console.log('Duplicate id:', w.id); problems++; }
      ids.add(w.id);
      ['word','meaning','trick','examples','isRepeated'].forEach(key => {
        if (w[key] === undefined) { console.log('Missing', key, 'in', w.word); problems++; }
      });
      if (!Array.isArray(w.examples) || w.examples.length < 2) {
        console.log(w.word, 'needs at least 2 examples'); problems++;
      }
    });
    console.log(problems === 0 ? 'All good ✅' : problems + ' issue(s) found ❌');
  "
  ```

- **Bulk-add from a spreadsheet.** If you're collecting words in Excel/Google Sheets, export to CSV and write a small one-off Node/Python script to convert rows into this JSON schema, then merge into `data.json`. This avoids manual JSON-editing errors at scale.
- **Split files only if needed.** Up to ~2,000 entries (roughly 600–800KB of JSON), a single `data.json` loads fast over `fetch()` and needs no changes to the app. If you eventually go far beyond that, you could shard into `data-1.json`, `data-2.json`, etc., and update `loadVocabData()` in `script.js` to `Promise.all()`-fetch and concatenate them — but this isn't necessary for the 2,000-word target.
- **Keep `isRepeated` honest.** Only mark words `true` if you can cite where they appeared (use `examTag`). This keeps PYQ Master genuinely high-value instead of diluted.

## How each screen works

- **PYQ Master** — filters `state.allWords` to `isRepeated === true` and renders them as cards with the exam tag, meaning, and memory trick.
- **Flashcard Vault** — walks through the *entire* word bank (not just PYQ) with a tap-to-flip 3D card: front shows the word, back shows meaning + trick + synonym/antonym.
- **Quiz Arena** — each round randomly samples 10 words, and for each one generates 4 options (1 correct meaning + 3 distractor meanings pulled from other random words). After answering, it shows Correct/Wrong, the explanation (the word's memory trick), and 2 real-life usage examples.

## Customizing the theme

All colors are defined as CSS variables at the top of `style.css` under `:root`. Change `--orange-primary`, `--orange-deep`, etc. in one place to re-theme the entire app.
