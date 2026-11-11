# Köln Game Starter (Next.js + GSAP + MongoDB)

Scroll karne par hero road par chalta hai. Raste me **coins** (vocabulary), har session ek **stop** (obstacle),
aakhri stop **Boss Exam**. Obstacle clear kiye bina road aage nahi khulti.
Koi 3D model ya image nahi: background inline SVG hai, animation sirf `transform`.

## Chalana

```bash
npm install
npm run dev
# http://localhost:3000  ->  /course/koeln/play
```

`MONGODB_URI` set nahi hai to `data/koeln.json` ka demo data chalta hai.

## Apni site me jodna (3 cheezein)

1. **Folders copy karo**: `components/game/`, `lib/scenery.js`, `lib/toStops.js`,
   `app/course/[slug]/play/page.jsx`, `app/api/game/progress/route.js`.
   Dependency: `npm i gsap` (ScrollTrigger isi me aata hai).
2. **`lib/toStops.js`**: apne session document ke asli field names yahan map karo
   (`type`, `title`, `words`, `pairs`, `sentences`, `questions`). Sirf yahi file schema jaanti hai.
3. **`lib/auth.js`**: `getUserId()` ko apne login se jodo. Aur `play/page.jsx` me collection names
   (`chapters`, `sessions`, `session_progress`) apne hisaab se badlo.

Apne course page ke "Play Next" button ko `/course/<slug>/play` par bhejo.

## Obstacle types

| `kind` | Game me | Data |
|---|---|---|
| `coins` | sirf coins, quiz nahi | `coins: [{de, hi}]` |
| `mcq` | sawal + 3 options (Say It / Translate / Fill Blanks) | `questions: [{q, options, answer}]` |
| `match` | de ↔ hi jodo | `pairs: [{de, hi}]` |
| `order` | words sahi kram me | `sentences: [{words, hint}]` |
| `link` | Speaking / Reading / Writing: existing session page kholta hai | `href` |
| `boss` | chapter ke mixed sawal | `questions` |

`link` stop tab clear hota hai jab course me wo session complete ho (page `force-dynamic` hai,
isliye wapas aane par DB se naya status aata hai).

## Light rakhne ke liye jo kiya

- Game `next/dynamic` + `ssr: false` se sirf is page par load hota hai.
- GSAP bhi `import()` se lazy aata hai.
- Har city ka data alag; sirf us city ke sessions DB se aate hain.
- Background: inline SVG (`lib/scenery.js`), koi image request nahi.
- `prefers-reduced-motion` ka respect.

## Dhyan rakho

- Stage `100vh` ka sticky hai. Agar site ka fixed navbar hai to `.kg-stage` ki `height` me navbar ki height ghata do
  aur `.kg-hud` ka `top` adjust karo.
- In-game progress `game_progress` collection me jaata hai (`stars`, `coins`). Agar chahte ho ki match/order jaise
  obstacles clear karne par course ka `session_progress` bhi update ho, to `route.js` me wahi write add karo.
- Mic aur Writing ka auto-check game me nahi hai; wo existing session page par hi hote hain.
