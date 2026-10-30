# Human Potential — guided reflection experience

https://humanpotential.detleng.com/

## What visitors can do
1. Choose English, Roman Hindi/Urdu or Urdu. Urdu uses `lang="ur"` and right-to-left layout; Roman uses `ur-Latn` and left-to-right layout.
2. Select a starting path or one of eight chapters. Read a little, reflect optionally, and consider a manageable action.
3. Save a private reflection for a chapter/language. Mark a chapter explored if desired. Progress is a gentle record, not a score or streak.
4. Add a personal goal, smallest step and a flexible time in My journey. Press Save explicitly. Download a TXT copy of the current step.
5. Return using Continue reading. Export the journal, delete individual notes or clear all journey data after confirmation.
6. Open the full original reading whenever preferred. The original `content.js` is unchanged: 587 English, 586 Roman and 572 Urdu blocks. Explicit per-language chapter boundaries avoid the previous paragraph-length heading guessing.

## Privacy and behaviour
No backend, account, analytics or live AI conversation is added. Notes, explored chapter IDs, next-step fields, last chapter and language preference are stored under `hp.journey.v1` in the current browser/device. Other people using that browser profile may see them. Browser storage is not an encrypted vault and clearing browser data can erase the journal. Export TXT for a private backup. No journal import or cloud sync is claimed.

Writing is optional. Notes/steps save only when Save is pressed. A warning appears before leaving unsaved writing; a browser warning also protects page unload. Storage failure is reported. Exports contain saved notes plus current step fields and an unsaved current note if present. The download is a user-controlled local file; keep it private.

## Content and encouragement
The original reading remains intact. Newly added guided prompts/actions are labelled separately and available in all three languages. They offer reflection and realistic small steps, not personality assessment, diagnosis, therapy or guaranteed outcomes. Time, energy, circumstances and responsibilities are acknowledged. The graphic and favicon are decorative branding, not progress scores.

## UI
Responsive header/menu, language selector, accessible guide dialog, chapter navigation, readable typography, Urdu RTL, keyboard focus, reduced-motion preference, original dawn artwork and a professional ecosystem footer. Footer ecosystem order: DeTLeng, LFDS (Logic First Digital Solutions), DeTLeng Network. Contact uses Automation Desk.

## Files
- `content.js`: unchanged original reading.
- `journey-data.js`: translated UI, eight chapter boundaries, reflection prompts and suggested actions.
- `app.js`: local journal, rendering and interaction logic.
- `styles.css`, `index.html`, `assets/favicon.svg`: presentation.
- Existing illustrations and historical source verification tools retained. `tools/verify_content.py` needs its original referenced Word files; it was not presented as executed for this redesign.

## Local preview
Run `python -m http.server 8101 --bind 127.0.0.1` in this folder and open http://127.0.0.1:8101/. No installation or build required.

## Publishing
No Git commit, push or deployment performed by the coding agent. Run the included helper yourself:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "D:\DETLENG2\humanpotential-detleng\PUSH.ps1"
```

It pulls the existing GitHub main branch in a separate publish folder, copies only the public website files and commits/pushes without force. Existing remote files are retained. Browser-local test notes do not enter Git or the published website. Check GitHub Pages and HTTPS after publishing.

Urdu typography uses a locally bundled Noto Naskh Arabic variable font (SIL Open Font License, assets/fonts/OFL.txt). Reading is 28px desktop / 25px mobile, with larger Urdu controls and supporting text. No font CDN is required.
