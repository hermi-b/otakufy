📚 Otakufy — Spotify Lyrics Furigana Extension

Otakufy is a lightweight Chrome extension that automatically adds furigana (ふりがな) to Japanese lyrics displayed on Spotify Web Player.
It uses the Kuromoji Japanese tokenizer to detect kanji, generate readings, and insert <ruby> annotations directly into the lyrics.

Perfect for Japanese learners who want to enjoy music and study vocabulary at the same time.

✨ Features

Automatically detects Japanese lyrics on Spotify Web Player

Adds furigana above kanji using <ruby> tags

Smart kanji–reading alignment using Kuromoji morphological analysis

Adjustable furigana size (via extension popup)

Efficient DOM manipulation that preserves Spotify styling

Runs seamlessly in the background

📁 Repository Structure

otakufy/
|
+-- manifest.json
+-- content-script.js
+-- kuromoji.js
|
+-- dict/                  # Required Kuromoji dictionary files
|   +-- base.dat
|   +-- cc.dat
|   +-- ... (other dict files)
|
+-- popup.html             # Popup UI (for adjusting furigana size)
+-- popup.js
|
+-- icons/                 # Optional extension icons
|   +-- icon16.png
|   +-- icon48.png
|   +-- icon128.png
|
+-- README.md

⚠️ Important: Users must download the entire repository — including the dict/ folder — or Kuromoji will not initialize.

🚀 Installation (Developer Mode)

Download or clone this repository.

Open Google Chrome and go to:

chrome://extensions/

Enable Developer Mode (top-right corner).

Click Load unpacked.

Select the folder containing this project (otakufy/).

The extension should now appear in your Chrome extensions list.

🎵 How It Works

When you visit https://open.spotify.com
, the extension’s content-script.js runs automatically.

It loads Kuromoji using:

kuromoji.builder({ dicPath: chrome.runtime.getURL('dict/') }).build(...)


The script detects lyric elements from Spotify’s dynamic DOM.

Each Japanese lyric line is tokenized and converted into:

<ruby>漢字<rt>かんじ</rt></ruby>


A popup UI allows adjusting furigana size using a stored CSS variable.

⚙️ Usage

Open Spotify Web Player

Play a song containing Japanese lyrics

Open the lyrics view

Furigana will automatically appear above kanji — no buttons needed!

🔧 Troubleshooting

Furigana not appearing?

Ensure the dict/ folder is included when loading the extension

Refresh Spotify after installing

Make sure Developer Mode is enabled

Seeing Kuromoji loading errors?
Confirm that required resources are listed in web_accessible_resources in manifest.json.

Spotify updated and furigana broke?
Spotify periodically changes its DOM selectors — updating the selectors in content-script.js usually resolves the issue.

🛠️ Built With

JavaScript

Kuromoji.js

Chrome Extensions (Manifest V3)

Reverse-engineering Spotify Web Player DOM
