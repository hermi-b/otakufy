📚 Otakufy — Spotify Lyrics Furigana Extension

Otakufy is a lightweight Chrome extension that automatically adds furigana (ふりがな) to Japanese lyrics displayed on Spotify Web Player.
It uses the Kuromoji Japanese tokenizer to detect kanji, generate readings, and insert <ruby> annotations directly into the lyrics.

Perfect for Japanese learners who want to enjoy music and study vocabulary at the same time.

✨ Features

Automatically detects Japanese lyrics on Spotify Web Player

Adds furigana above kanji using <ruby> tags

Smart kanji–reading alignment using Kuromoji’s morphological analysis

Adjustable furigana size (via popup UI)

Non-destructive DOM manipulation to avoid breaking Spotify's lyric rendering

Runs quietly in the background — no UI clutter

📁 Repository Structure

Your repo will include files similar to:

otakufy/
│
├── manifest.json
├── content-script.js
├── kuromoji.js
├── dict/                # Folder containing Kuromoji dictionary files
│   ├── base.dat
│   ├── cc.dat
│   ├── ... (other dict files)
│
├── popup.html           # Optional popup UI for adjusting furigana size
├── popup.js
├── icons/               # Optional icons for the extension
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│
└── README.md


⚠️ Important:
The dict/ folder required by Kuromoji is often overlooked.
Users must download the entire repository including this folder, or the tokenizer will fail to load.

🚀 Installation (Developer Mode)

Download or clone this repository to your computer.

Open Google Chrome and go to:

chrome://extensions/


Enable Developer Mode (toggle in the top right).

Click Load unpacked.

Select the folder containing this extension (otakufy/).

Chrome will load the extension immediately.

🎵 How It Works

When you visit open.spotify.com, the content-script.js runs automatically.

It loads Kuromoji using:

kuromoji.builder({ dicPath: chrome.runtime.getURL('dict/') }).build(...)


The script detects Spotify’s lyric lines using selectors such as:

[data-testid="lyrics-container"]

.lyrics-lyrics-content

For each lyric span:

Tokenizes the Japanese text

Aligns readings to kanji at a sub-token level

Replaces text nodes with <ruby> markup

Optional: The popup lets users adjust furigana size (rt font-size), which updates a CSS variable stored in Chrome local storage.

⚙️ Usage

Open Spotify Web Player.

Play any song with Japanese lyrics.

Open lyrics (the right-side panel or fullscreen lyrics).

The kanji will automatically display furigana.

You don’t need to press any buttons — everything is handled automatically.

🔧 Troubleshooting

Furigana not showing?

Make sure you loaded the entire repo, especially the dict/ folder.

Refresh Spotify after installing the extension.

Check that Developer Mode is still enabled.

Tokenization error in console?
Chrome may have blocked kuromoji.js from loading if it isn't properly listed in web_accessible_resources.

Lyrics format changed?
Spotify occasionally updates their DOM. If furigana stops appearing, a selector may need updating.

🛠️ Built With

JavaScript

Kuromoji.js

Chrome Extensions Manifest V3

Spotify Web Player DOM reverse-engineering
