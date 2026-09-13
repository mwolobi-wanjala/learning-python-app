# JANS TECH Offline App Setup

This project is now a PWA. The existing homepage remains at `pages/index.html`; the new root `index.html` launcher makes the required manifest start URL work without moving or changing lesson content.

## Added Files

- `manifest.json`: install metadata, icons, and shortcuts.
- `sw.js`: versioned offline cache and navigation fallback.
- `offline.html`: branded fallback when a requested page is unavailable.
- `index.html`: root launcher to the existing homepage.
- `icons/icon-192.png` and `icons/icon-512.png`: generated app icons.
- `capacitor.config.json`: Capacitor Android configuration.
- `package.json`: Capacitor dependencies and local server commands.

Every HTML page includes the manifest metadata and service-worker registration. Pages under `pages/` use `../manifest.json`, `../icons/icon-192.png`, and `../sw.js`; root files use `./` paths.

## Local PWA Testing

1. Open PowerShell in the project folder.
2. Start a local HTTP server:

```powershell
python -m http.server 8000
```

3. Open `http://localhost:8000/` in Chrome or Edge.
4. Visit several lessons and the Contact page while online so the service worker can install and cache the app shell.
5. Use DevTools > Application > Service Workers to confirm the worker is active.
6. Use DevTools > Network > Offline, then reload and navigate between cached pages.

Do not open the files with `file:///...`. Service workers require HTTPS or a secure localhost origin.

## GitHub Pages

1. Create a GitHub repository and push this project.
2. Open Settings > Pages.
3. Choose GitHub Actions or Deploy from a branch.
4. Publish the repository root.
5. Open the generated HTTPS URL and install the PWA.

GitHub Pages supplies HTTPS, which is required for service-worker registration outside localhost.

## Netlify Drop

1. Open Netlify Drop at `https://app.netlify.com/drop`.
2. Drag the entire project folder into the drop area.
3. Open the generated HTTPS URL.
4. Test installation and offline mode before sharing the URL.

## Vercel

1. Install and authenticate the Vercel CLI, or import the repository in the Vercel dashboard.
2. Set the project root to this folder.
3. Use no build command and keep the output directory as the project root.
4. Deploy and open the HTTPS URL.

## Android APK With Capacitor

Install Node.js, Android Studio, and the Android SDK first. From the project folder run:

```powershell
npm install
npx cap add android
npx cap sync android
npx cap open android
```

In Android Studio:

1. Let Gradle finish syncing.
2. Select an emulator or connected Android phone.
3. Press Run to test the bundled app offline.
4. Select Build > Generate Signed Bundle / APK.
5. Choose Android App Bundle for Google Play, or APK for direct installation.
6. Create or select a keystore, choose the `release` build variant, and complete the wizard.
7. Keep the keystore and passwords private. Do not commit them to Git.
8. For Play Store publishing, upload the signed `.aab` in Play Console and complete the store listing, privacy, content rating, and data-safety forms.

For future web changes, run:

```powershell
npx cap sync android
```

The configured Capacitor values are:

```json
{
  "appId": "com.janstech.python",
  "appName": "JANS TECH",
  "webDir": ".",
  "bundledWebRuntime": false
}
```

## iOS Home Screen Installation

1. Deploy to an HTTPS URL.
2. Open the URL in Safari on the iPhone or iPad.
3. Tap Share > Add to Home Screen.
4. Confirm the name `JANS TECH` and tap Add.

The Apple mobile web-app metadata is included on every page. iOS service-worker and storage behavior can vary, so test the installed app on the target Safari version.

## Icon Generation

The current icons were generated from the existing image using the colors `#0b1e2f` and `#ffd966`. To create new artwork:

1. Use favicon.io or Canva.
2. Use a square canvas with a dark blue background `#0b1e2f`.
3. Use gold `#ffd966` for the Python/JANS TECH mark.
4. Export PNG files at exactly 192x192 and 512x512.
5. Save them as `icons/icon-192.png` and `icons/icon-512.png`.
6. Bump `CACHE_VERSION` in `sw.js` and reload after replacing icons.

Optional Pillow alternative:

```powershell
python -m pip install Pillow
```

```python
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

output = Path("icons")
output.mkdir(exist_ok=True)
for size in (192, 512):
    image = Image.new("RGB", (size, size), "#0b1e2f")
    draw = ImageDraw.Draw(image)
    draw.ellipse((size * .12, size * .12, size * .88, size * .88), fill="#ffd966")
    draw.text((size * .22, size * .37), "JT", fill="#0b1e2f")
    image.save(output / f"icon-{size}.png")
```

## Testing Checklist

- [ ] Serve with `python -m http.server 8000`, not `file://`.
- [ ] Confirm the manifest loads in DevTools > Application > Manifest.
- [ ] Confirm `sw.js` is active under Application > Service Workers.
- [ ] Visit the homepage, all 19 lessons, and Contact while online.
- [ ] Enable DevTools Offline mode and reload each cached page.
- [ ] Confirm the offline fallback appears for an uncached route.
- [ ] Confirm the install prompt appears after 30 seconds when the browser offers installation.
- [ ] Test Android installation, then enable airplane mode and reopen the app.
- [ ] Test Safari > Share > Add to Home Screen on iOS.
- [ ] Run a Lighthouse PWA audit and address any browser-specific warnings.
- [ ] Change `CACHE_VERSION` from `v1.0.0` to `v1.0.1`, reload, and confirm the old cache is removed.

## Troubleshooting

### Service worker does not register
Use `http://localhost:8000` or an HTTPS deployment. Check the browser console and make sure `sw.js` is served from the project root.

### The install prompt does not appear
The browser controls `beforeinstallprompt`. Use HTTPS, visit the site first, wait 30 seconds, and check that the app is not already installed or previously dismissed with `pwa-dismissed` in local storage.

### Styles or icons are missing offline
Reload once while online, then inspect the Cache Storage entries. Font Awesome is cached opportunistically from its CDN; the app remains usable if the CDN is unavailable.

### Updated content is not visible
Increment `CACHE_VERSION` in `sw.js`, reload twice, and check Application > Service Workers for the active worker.

### GitHub Pages shows a blank page
Confirm the repository is publishing its root and that the deployed URL can open `/index.html`, `/manifest.json`, and `/sw.js` directly.

### Android build fails
Update Android Studio, Android SDK tools, and Gradle-compatible JDK, then run `npx cap sync android` again. Delete and regenerate the `android/` folder only if it has not been customized.

## Next Steps For Play Store Publishing

1. Replace the generated icons with final branded artwork if needed.
2. Set a production version code and version name in Android Studio.
3. Create a release keystore and store it securely outside the repository.
4. Generate a signed Android App Bundle (`.aab`).
5. Create the Play Console app using the package ID `com.janstech.python`.
6. Add screenshots, app description, privacy policy URL, category, content rating, and data-safety answers.
7. Upload the signed bundle to an internal testing track first.
8. Test installation and offline navigation from the Play-distributed build.
9. Promote the tested release to production.
