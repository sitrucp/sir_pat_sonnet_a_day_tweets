# @SirPatStew #ASonnetADay historical dashboard

A static dashboard of Sir Patrick Stewart's Shakespeare sonnet tweets from the 2020 COVID-19 lockdown. It includes a Plotly dot chart of historical likes and retweets and a sortable table linking to the original tweets.

Published site: https://sitrucp.github.io/sir_pat_sonnet_a_day_tweets/

## Archive coverage

This is a **partial July 2020 archive**, not the complete sonnet series or current Twitter/X statistics. It contains 63 tweets posted March 23–July 3, 2020. The recorded snapshot update is **2020-07-04 11:42 AM**; the timestamp does not specify a timezone.

The existing sonnet parser recognizes 59 chart entries. The table also includes four records classified as intermissions. Historical totals for the charted records are **1,131,072 likes** and **198,670 retweets**; these totals exclude intermissions.

Sonnet parsing is unchanged. It uses the first matching `Sonnet`, `Sonnets`, or `Number` phrase, so ambiguous or combined-sonnet tweets retain their original classification.

## Local data and provenance

The page loads these files using paths relative to `index.html`:

- `data/sirpattweets.js`: the 63 recovered records, assigned to `sirpatArchiveTweets`.
- `data/last-update.js`: the recorded update timestamp, assigned to `sirpatArchiveUpdated`.

These are JavaScript data scripts, **not pure JSON**. The historical files had `.json` extensions but also contained JavaScript variable assignments. Replacing a data script with raw JSON requires changing the loader.

Records were recovered from commit `8d4d4cad7b913253667bc4a476bd729290cb8883`:

- [Historical tweet data](https://github.com/sitrucp/sir_pat_sonnet_a_day_tweets/blob/8d4d4cad7b913253667bc4a476bd729290cb8883/upload/sirpattweets.json)
- [Historical update timestamp](https://github.com/sitrucp/sir_pat_sonnet_a_day_tweets/blob/8d4d4cad7b913253667bc4a476bd729290cb8883/upload/last_update_date.json)

The record values, tweet text, IDs, and original tweet URLs are preserved. Videos are not bundled; their availability depends on Twitter/X. The local `archive/` folder is ignored by Git and is not the page's data source.

## Preview and verification

Open `index.html` in a browser with internet access, or serve the repository with a local static server. There is no application build step or Python dependency for displaying the dashboard.

Check that:

1. The partial-archive notice and historical timestamp appear.
2. The chart shows Likes and Retweets, with 59 points per series and the totals above.
3. The table contains 63 rows, initially ordered newest first.
4. Column headings sort in both directions, and links retain the original tweet destinations.
5. Missing/invalid tweet data or unavailable display libraries produce readable messages.

The data scripts are local, but jQuery, D3, tablesorter, Plotly, Bootstrap, and the existing analytics script still use external services. This is not an offline bundle.

`tweets.py` is the separate legacy Twitter collection/S3 upload script. It is not run by the dashboard and has not been adapted to regenerate this archive. Its private configuration is not needed to view the site.

## Hosting

The project remains a static GitHub Pages site. Keep `index.html`, `sirpat.js`, and the `data/` directory together at the configured publishing root. Relative data paths support the repository's GitHub Pages subdirectory.

Check the repository's Pages settings before pushing changes to its publishing source; such a push may publish automatically. Local previewing and editing do not deploy the site.
