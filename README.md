# Matthew J. Peffer — Portfolio

A static portfolio site designed for GitHub Pages. Built with plain HTML, CSS, and JavaScript; no build step or paid hosting required.

## Publish with GitHub Pages

1. Create a public repository named `eggwhat5.github.io` under the GitHub account `eggwhat5` (or choose another repository name).
2. Upload the contents of this folder, including the `media/` directory, to the repository root and commit them to the `main` branch.
3. In the repository, open **Settings → Pages**. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. GitHub Pages will publish to `https://eggwhat5.github.io/` after its first deployment completes.

If you publish from a repository with another name, the address will be `https://eggwhat5.github.io/repository-name/`.

## Media included

The `media/` folder contains the Brainchip Arena and Windbound gameplay clips, the Vs. Imposter artwork, the Multi-FX pedal video and poster, and four user-made texture images used for subtle visual accents. Keep the whole folder when uploading the site.

## Live counts

The page requests Brainchip Arena's current player count and approximate online-presence counts for the Brainchip, Windbound, and Vs. Imposter Discord servers. Counts refresh every five minutes. If a public endpoint is unavailable, the page displays “Count unavailable.” These live counts require the site to be served over HTTPS; they may not load when opening the HTML file directly.

## Before publishing

Check that the linked Roblox pages and Discord invites are the ones you want public. The page intentionally omits the phone number from the resume. The Windbound card notes that its score is unreleased and project details are limited during development.

## Portfolio radio

The Audio Lab includes a selectable player for four Brainchip Album 2 tracks. Intermission is selected by default. Audio is loaded only when a track is chosen or played; the supplied WAV masters are included in `media/radio/`.
