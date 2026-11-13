# FitLife

Een moderne React Native / Expo fitness-app voor iOS, Android en het web als
installable Progressive Web App (PWA).

## Starten

```bash
npm install
npm start
```

Op Windows kun je ook `start-fitlife.bat` dubbelklikken. Het script installeert
dependencies wanneer `node_modules` nog ontbreekt en start daarna Expo.

## Installeren op iPhone

Voor een echte installeerbare iPhone-app:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
eas submit --platform ios
```

Je hebt hiervoor een Apple Developer-account nodig. Na `eas submit` verschijnt
de build in App Store Connect, waar je hem via TestFlight op je iPhone kunt
installeren. Zonder Apple Developer-account kun je de app direct testen via
Expo Go en de QR-code met `npx expo start`.

Open daarna de app in Expo Go, iOS Simulator, Android Emulator of web.

## PWA bouwen voor Cloudflare

Maak eerst de productie-build:

```bash
npm run build:web
```

De deploybare bestanden staan daarna in `dist`. Gebruik in Cloudflare Pages:

- **Build command:** `npm run build:web`
- **Build output directory:** `dist`
- **Framework preset:** Expo / None

Gebruik als Cloudflare Workers Static Assets wordt gebruikt:

- **Deploy command:** `npx wrangler deploy`
- **Build command:** `npm run build:web`
- **Assets directory:** `dist`
- Commit ook `wrangler.jsonc` zodat Wrangler geen interactieve projectconfiguratie hoeft te maken.

Gebruik niet `npx expo export -p web` als build command, omdat daarmee de
extra PWA-meta-tags uit `scripts/prepare-pwa.js` niet worden toegevoegd.

Cloudflare Pages serveert daarna FitLife via HTTPS. Open de URL op je telefoon
en kies in Safari **Deel > Zet op beginscherm**. In Chrome/Android kies je
**Installeren**. De service worker zorgt voor app-shell caching en offline
herladen nadat de app minimaal één keer online is geopend.

## Eerste release

- Dashboard met geanimeerd ogende voortgangsringen voor stappen, water, beweging en weekdoel.
- Ondersteuning voor lichte en donkere modus, opgeslagen met AsyncStorage.
- Activiteit, voeding, water, statistieken en profiel via de onderste navigatie.
- Persoonlijke doelen kunnen vanuit Profiel worden aangepast.
- Lokale opslag van dashboardgegevens als basis voor de Supabase-integratie.

## Volgende stap: Supabase

De UI en opslaglaag zijn bewust los gehouden. Voeg een Supabase-client toe via environment variables (`EXPO_PUBLIC_SUPABASE_URL` en `EXPO_PUBLIC_SUPABASE_ANON_KEY`) en vervang de AsyncStorage-laag met auth en tabellen die met Row Level Security op `user_id` filteren.
