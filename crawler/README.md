# Royal Rumble data tools

These offline tools prepare the wrestler manifest, images, and historical match data consumed by the Laravel production seeder.

## Setup

From `crawler/`:

```bash
poetry install
```

Python 3.11 or newer is required.

## Commands

```bash
poetry run crawl
```

Fetches the years configured in `src/royal_rumble_crawler/crawl.py` and writes JSON files below `data/matches/`.

```bash
./scripts/get_names.sh
```

Extracts wrestler names from `data/matches/` into `data/names.txt`. This requires `jq`.

```bash
poetry run crawl-pictures
```

Refreshes `data/saved_superstars.json` and validated images under `data/images/`. Downloads are written atomically. Failed or invalid downloads are recorded with a `null` `file_name`, allowing the application to display its existing image fallback.

```bash
poetry run pytest
```

Runs parser, downloader, output-path, and complete production-data integrity checks without making network requests.

## Historical entrance order

Most annual files now contain verified explicit entrance numbers sourced through the Wikimedia Action API. Regenerate them manually with:

```bash
poetry run regenerate-entrance-order
```

The command is bounded to 1988–2026, preserves all existing Cagematch identity and elimination records, and fails closed when a source entrant cannot map exactly once. Network regeneration never runs in CI. See [`data/MATCH_DATA.md`](data/MATCH_DATA.md) for source revisions, CC BY-SA attribution, transformations, and the explicitly listed legacy/unverified years.
