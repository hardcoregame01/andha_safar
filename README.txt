BLIND PATH - website + installable app (PWA)

FILES
  index.html             Landing page: hero, "Play in Browser", "Download Game" (installs the app), features, levels, controls
  play.html              The game (intro animation, pause menu with Restart)
  mini3d.js              3D engine
  config.js              Online server settings (Supabase URL + key) and optional APK / Windows download links
  manifest.webmanifest   App info (name, icons, fullscreen) - makes the site installable
  sw.js                  Service worker - offline play + fast loading
  icons/                 App icons (192, 512, maskable, Apple)
  img/                   Screenshots + og-image.png (share preview)
  Blind-Path-Game.html   Optional single-file offline copy (shown inside the install guide)
  robots.txt, build_download.py

HOW "DOWNLOAD GAME" WORKS
  - It INSTALLS the game as an app: icon on the phone home screen / desktop, opens full screen without browser bars, works offline.
  - Chrome / Edge / Android: a native "Install" popup appears. iPhone: the guide shows Share > Add to Home Screen.
  - IMPORTANT: installing only works on the LIVE website (https://yourdomain.com) or on http://localhost.
    It does NOT work when index.html is opened as a file from the computer (file:///...).

BEFORE PUBLISHING
  1. Fill config.js (Supabase url + key) so accounts and the leaderboard work on all devices.
  2. Replace  YOURDOMAIN.com  with your real domain in index.html and play.html.
  3. Upload ALL files and folders (icons, img) to the ROOT of your hosting. The host must serve https (Cloudflare Pages, Netlify, GitHub Pages all do).
  4. Open the site on your phone: tap Download Game > Install. The Blind Path icon appears on the home screen.
  5. After changing any game file, edit CACHE = 'blind-path-v1' in sw.js to 'blind-path-v2' (and so on) so players get the new version.

REAL .APK (Android) AND WINDOWS INSTALLER (optional)
  After the site is live on https:
  - Go to https://www.pwabuilder.com, enter your website address, press Start.
  - Choose "Android" (gives an .apk / .aab) and/or "Windows" (gives an installer package) and download.
  - Upload the files to a "downloads" folder on your site and set the paths in config.js:
        window.BP_DOWNLOADS = { apk: "downloads/BlindPath.apk", windows: "downloads/BlindPath-Setup.exe" };
    The install guide will then show "Android APK" / "Windows installer" buttons.
  - For Google Play Store you need a Google Play developer account (one-time fee).
