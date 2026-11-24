# Skolval

Sida för Charlies gymnasieval: alla skolor i Stockholms stad och Nacka med naturvetenskapsprogrammet,
med antagningspoäng, chans utifrån hans meritvärde, öppet hus, restid från Sandsborg,
favoriter, besök, kommentarer och dolda skolor.

Adress: **https://skolval.klingemo.se**, skyddad med ett gemensamt familjelösenord.

## Hur den är byggd

- `public/index.html`: hela sidan (HTML, CSS och JavaScript i en fil, inga byggsteg).
- `api/`: små serverfunktioner på Vercel.
  - `login.js` kontrollerar lösenordet och sätter en inloggningscookie.
  - `schools.js` läser, lägger till och uppdaterar skolor.
  - `settings.js` sparar Charlies meritvärde.
- `lib/`: lösenordskontroll, Supabase-anrop och vilka fält som får sparas.
- `migrations/0001_init.sql`: tabellerna `skolval_schools` och `skolval_settings`.

Datan ligger i **samma Supabase-projekt som gymkollen** (gym.klingemo.se), i egna tabeller
med prefixet `skolval_`. Tabellerna har RLS påslaget utan regler, så de nås bara via
servern med service-role-nyckeln. Nyckeln skickas aldrig till webbläsaren.

## Miljövariabler (sätts i Vercel-projektet)

| Namn | Vad |
|---|---|
| `SITE_PASSWORD` | familjelösenordet. Byt det här för att logga ut alla. |
| `SUPABASE_URL` | gymkollens Supabase-projekt, t.ex. `https://abcd.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role-nyckeln för samma projekt (hemlig) |

## Vanliga uppgifter

- **Byta lösenord:** Vercel → projektet `skolval` → Settings → Environment Variables →
  `SITE_PASSWORD` → spara → Deployments → Redeploy.
- **Se eller rätta data direkt:** Supabase → gymkollens projekt → Table Editor →
  `skolval_schools`.
- **Driftsätta en ändring:** `npx vercel deploy --prod --scope mmdesign`.

Antagningssiffror och öppet hus-datum är hämtade från skolornas webbplatser och sajter som
velja.se, ednia.se och skolsafari.se i november 2026. Kontrollera alltid mot skolan.
