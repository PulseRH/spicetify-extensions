# Spicetify Extensions

A small collection of [Spicetify](https://spicetify.app) extensions.

Install any of them through the **Spicetify Marketplace** (Extensions tab), or
manually — see [Manual install](#manual-install) below.

---

## Library Overlay Cards

`library-overlay-cards.js`

Reworks the library grid so every card is a clean square of cover art, with the
title and owner overlaid on the artwork instead of stacked underneath.

- Forces a 1:1 aspect ratio so rows line up properly
- Title and owner sit on top of the cover, not below it
- Top-aligns cards so uneven text no longer staggers the grid

## Folder Artwork

`folder-artwork.js`

Playlist folders normally show a plain generic icon. This gives them artwork
built from the playlists inside them.

- Fewer than 4 playlists → shows the first playlist's cover
- 4 or more → shows a 2×2 mosaic of the first four covers
- Adds a coloured accent border and drop shadow so folders stay visually
  distinct from playlists

## Volume Plus (updated)

`volume-plus.js`

Finer-grained volume control — scroll over the volume bar, or use the arrow
keys, to adjust in smaller steps than Spotify allows by default.

> **Credit:** this is an updated fork of
> [Aspecky/spicetify-extensions](https://github.com/Aspecky/spicetify-extensions).
> All original credit goes to **Aspecky**; this copy exists only because the
> upstream version stopped working on current Spotify builds. If upstream
> resumes, use theirs.

---

## Manual install

Copy the `.js` file into your Spicetify extensions folder:

| OS | Path |
| --- | --- |
| Windows | `%APPDATA%\spicetify\Extensions\` |
| Linux / macOS | `~/.config/spicetify/Extensions/` |

Then register and apply it:

```bash
spicetify config extensions library-overlay-cards.js
spicetify apply
```

On Windows PowerShell, chain with `;` rather than `&&`:

```powershell
spicetify config extensions library-overlay-cards.js; spicetify apply
```

## License

MIT — except `volume-plus.js`, which inherits the license of the
[original project](https://github.com/Aspecky/spicetify-extensions).
