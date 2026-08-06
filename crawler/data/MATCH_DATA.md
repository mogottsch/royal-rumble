# Historical match data

The Cagematch-derived `matches/YYYY.json` files preserve wrestler identities,
Cagematch IDs, and elimination data. Their original `wrestlers` array order is
result/participant order, **not entrance order**.

Verified files contain an `entrance_order` object and explicit
`wrestlers[].entrance_number` values derived from the `Draw` and `Entrant`
columns on the English Wikipedia annual event page. Source URL and exact
revision ID are stored in every verified file. The data was adapted by mapping
source spellings onto the existing Cagematch wrestler records; identity and
elimination records were not replaced.

Source text and table presentation are available under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Attribution:
Wikipedia contributors, “Royal Rumble (YEAR),” English Wikipedia, revision and
URL recorded in each file. The generated output indicates its transformation
in `entrance_order.changes`.

`matches/legacy-unverified-years.json` lists years that could not be mapped
without fabrication because an entrant is missing or duplicate in the
preserved Cagematch objects. Those files remain unchanged and are explicitly
warned about by `ProductiveSeeder`.

## Regeneration

From `crawler/`:

```bash
poetry install
poetry run regenerate-entrance-order
```

The command makes a bounded request set for annual pages 1988–2026 through the
official Wikimedia Action API, sends a contact-bearing User-Agent, selects the
men’s/open annual match by section heading and identity overlap, parses columns
by the `Draw`/`Entrant` headers, and fails closed per year on non-contiguous
draws or ambiguous identity mapping. It never changes existing Cagematch IDs or
elimination data. Network regeneration is manual; CI uses offline fixtures and
integrity tests only.

The 2026 annual event is complete as of the recorded Wikipedia revision and is
included as a verified 30-person men’s match. The unrelated 2018 Greatest Royal
Rumble is intentionally outside this annual-event dataset.
