"""Regenerate verified annual Royal Rumble entrance numbers from Wikimedia.

This module deliberately updates only the ``entrance_number`` field and source
metadata in the existing Cagematch-derived JSON. Existing wrestler identities,
Cagematch IDs, eliminations, and other records are preserved byte-for-byte at
the object level.
"""

from __future__ import annotations

import argparse
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from bs4 import BeautifulSoup

API_URL = "https://en.wikipedia.org/w/api.php"
USER_AGENT = (
    "SuffRoyaleEntranceOrder/1.0 "
    "(https://github.com/moket-labs/royal-rumble; contact: gottschling.moritz@gmail.com)"
)
LICENSE = "CC BY-SA 4.0"
LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/"

# Source spellings/gimmicks that differ from the existing Cagematch record.
# Keys and values use normalize_name(); entries are reviewed, not fuzzy matches.
NAME_ALIASES = {
    "brianbblair": "bbrianblair",
    "bushwhackerbutch": "butch",
    "bushwhackerluke": "luke",
    "canadianearthquake": "earthquake",
    "harleyrace": "kingharleyrace",
    "jakeroberts": "jakeroberts",
    "jimneidhart": "jimneidhart",
    "junkyarddog": "thejunkyarddog",
    "onemangang": "theonemangang",
    "ultimatewarrior": "theultimatewarrior",
    "hacksawjimduggan": "jimduggan",
    "elmatador": "titosantana",
    "kinghaku": "haku",
    "themodelrickmartel": "rickmartel",
    "texastornado": "thetexastornado",
    "undertaker": "theundertaker",
    "britishbulldog": "thebritishbulldog",
    "123kid": "the123kid",
    "stonecoldsteveaustin": "steveaustin",
    "jakethesnakeroberts": "jakeroberts",
    "jessejames": "jessejammes",
    "theartistformerlyknownasgoldust": "tafkagoldust",
    "kamamustafa": "thegodfather",
    "mrmcmahon": "vincemcmahon",
    "matthardy": "matthardyversion10",
    "andradecienalmas": "andradealmas",
    "genichirotenryu": "tenryu",
    "doinktheclown": "doink",
    "sione": "sionne",
    "kamamustafa": "kama",
    "princealbert": "albert",
    "billygunn": "mrass",
    "crashholly": "crash",
    "billy": "billygunn",
    "bobbylashley": "lashley",
    "joeymercury": "mercury",
    "johnnynitro": "nitro",
    "teddibiasejr": "teddibiase",
    "sheamus": "kingsheamus",
    "thegodwinns": "thegodwinns",
    "roadwarrioranimal": "animal",
    "bigshow": "thebigshow",
    "bigbossman": "thebigbossman",
    "godfather": "thegodfather",
    "blueMeanie": "thebluemeanie",
    "roadDogg": "theroaddogg",
    "rock": "therock",
    "aTrain": "theatrain",
    "hurricane": "thehurricane",
    "brianKendrick": "thebriankendrick",
    "greatKhali": "thegreatkhali",
    "mvp": "montelvontaviousporter",
    "rTruth": "rtruth",
    "bigE": "bige",
    "finnBalor": "finnbalor",
    "sethFreakinRollins": "sethrollins",
    "dominikMysterio": "dominikmysterio",
    "dirtyDominikMysterio": "dominikmysterio",
}
# Normalize accidental mixed-case literal keys above once at import time.


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(character for character in value if not unicodedata.combining(character))
    value = value.casefold().replace("’", "'")
    value = re.sub(r"\[[^]]*]", "", value)
    value = re.sub(r"\([^)]*(?:replaced|substitut|injur|unable)[^)]*\)", "", value)
    value = re.sub(r"\s*\((?:c|champion)\)\s*$", "", value)
    value = value.rstrip(" *")
    return re.sub(r"[^a-z0-9]+", "", value)


NAME_ALIASES = {normalize_name(key): normalize_name(value) for key, value in NAME_ALIASES.items()}


@dataclass(frozen=True)
class Entrant:
    draw: int
    name: str


@dataclass(frozen=True)
class SourceMatch:
    year: int
    label: str
    revision_id: int
    source_url: str
    entrants: tuple[Entrant, ...]


class WikimediaClient:
    def __init__(self, delay_seconds: float = 0.1):
        self.delay_seconds = delay_seconds

    def _get(self, parameters: dict[str, object]) -> dict:
        query = urllib.parse.urlencode(
            {"format": "json", "formatversion": 2, **parameters}
        )
        request = urllib.request.Request(
            f"{API_URL}?{query}",
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.load(response)
        time.sleep(self.delay_seconds)
        if "error" in payload:
            raise RuntimeError(payload["error"])
        return payload

    def annual_matches(self, year: int) -> list[SourceMatch]:
        title = f"Royal Rumble ({year})"
        page = self._get(
            {"action": "parse", "page": title, "prop": "sections|revid"}
        )["parse"]
        sections = [
            section
            for section in page["sections"]
            if "royal rumble" in section["line"].casefold()
            and "entrances and eliminations" in section["line"].casefold()
        ]
        if not sections:
            raise ValueError(f"{year}: no Royal Rumble entrances section")

        matches: list[SourceMatch] = []
        for section in sections:
            parsed = self._get(
                {
                    "action": "parse",
                    "page": title,
                    "prop": "text|revid",
                    "section": section["index"],
                }
            )["parse"]
            entrants = parse_entrance_table(parsed["text"])
            if entrants:
                matches.append(
                    SourceMatch(
                        year=year,
                        label=BeautifulSoup(section["line"], "html.parser").get_text(
                            " ", strip=True
                        ),
                        revision_id=int(parsed["revid"]),
                        source_url=(
                            "https://en.wikipedia.org/wiki/"
                            + urllib.parse.quote(title.replace(" ", "_"), safe="()_")
                        ),
                        entrants=tuple(entrants),
                    )
                )
        if not matches:
            raise ValueError(f"{year}: headings found but no Draw/Entrant table parsed")
        return matches


def parse_entrance_table(html: str) -> list[Entrant]:
    soup = BeautifulSoup(html, "html.parser")
    candidates: list[list[Entrant]] = []
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        if not rows:
            continue
        header_cells = rows[0].find_all(["th", "td"], recursive=False)
        headers = []
        for cell in header_cells:
            cell = BeautifulSoup(str(cell), "html.parser")
            for element in cell.find_all(["sup", "small"]):
                element.decompose()
            headers.append(cell.get_text(" ", strip=True).casefold())
        draw_index = next((index for index, header in enumerate(headers) if header.startswith("draw")), None)
        entrant_index = next((index for index, header in enumerate(headers) if header.startswith("entrant")), None)
        if draw_index is None or entrant_index is None:
            continue
        entrants: list[Entrant] = []
        for row in rows[1:]:
            cells = row.find_all(["th", "td"], recursive=False)
            if max(draw_index, entrant_index) >= len(cells):
                continue
            draw_text = cells[draw_index].get_text(" ", strip=True)
            draw_match = re.search(r"\d+", draw_text)
            if not draw_match:
                continue
            entrant_cell = cells[entrant_index]
            for element in entrant_cell.find_all(["sup", "small"]):
                element.decompose()
            name = entrant_cell.get_text(" ", strip=True)
            name = re.sub(r"\s+", " ", name).strip()
            entrants.append(Entrant(int(draw_match.group()), name))
        if entrants:
            candidates.append(entrants)
    if not candidates:
        return []
    # A section may contain a legend or a duplicate responsive table; use the
    # largest structurally valid Draw/Entrant table.
    entrants = max(candidates, key=len)
    validate_draws(entrants)
    return entrants


def validate_draws(entrants: Iterable[Entrant]) -> None:
    draws = [entrant.draw for entrant in entrants]
    if len(draws) != len(set(draws)):
        raise ValueError(f"duplicate draw numbers: {draws}")
    if sorted(draws) != list(range(1, max(draws) + 1)):
        raise ValueError(f"non-contiguous draw numbers: {draws}")


def canonical_name(name: str) -> str:
    normalized = normalize_name(name)
    seen: set[str] = set()
    while normalized in NAME_ALIASES and normalized not in seen:
        seen.add(normalized)
        normalized = NAME_ALIASES[normalized]
    return normalized


def select_open_match(matches: list[SourceMatch], existing: list[dict]) -> SourceMatch:
    existing_names = {canonical_name(item["name"]) for item in existing}
    ranked = []
    for match in matches:
        label = match.label.casefold()
        if "women" in label or "female" in label:
            continue
        matched = sum(canonical_name(entrant.name) in existing_names for entrant in match.entrants)
        ranked.append((matched, len(match.entrants), match))
    if not ranked:
        raise ValueError("no men's/open Royal Rumble match found")
    ranked.sort(key=lambda value: (value[0], value[1]), reverse=True)
    best_score = ranked[0][:2]
    best_matches = [match for matched, count, match in ranked if (matched, count) == best_score]
    if len(best_matches) != 1:
        labels = ", ".join(match.label for match in best_matches)
        raise ValueError(f"ambiguous men's/open Royal Rumble match: {labels}")
    return best_matches[0]


def apply_match(payload: dict, match: SourceMatch) -> dict:
    existing = payload.get("wrestlers")
    if not isinstance(existing, list):
        raise ValueError(f"{match.year}: existing wrestlers must be a list")
    by_name: dict[str, list[dict]] = {}
    for item in existing:
        by_name.setdefault(canonical_name(item["name"]), []).append(item)

    assignments: list[tuple[dict, Entrant]] = []
    errors: list[str] = []
    used_objects: set[int] = set()
    for entrant in match.entrants:
        matches = by_name.get(canonical_name(entrant.name), [])
        matches = [item for item in matches if id(item) not in used_objects]
        if len(matches) != 1:
            errors.append(f"#{entrant.draw} {entrant.name!r}: matched {len(matches)} records")
            continue
        item = matches[0]
        used_objects.add(id(item))
        assignments.append((item, entrant))
    if errors:
        raise ValueError(f"{match.year}: identity mapping failed: " + "; ".join(errors))

    for item in existing:
        item.pop("entrance_number", None)
    for item, entrant in assignments:
        item["entrance_number"] = entrant.draw

    payload["entrance_order"] = {
        "status": "verified",
        "match": "men" if "men" in match.label.casefold() else "open",
        "label": match.label,
        "source_url": match.source_url,
        "source_revision_id": match.revision_id,
        "retrieved_from": "Wikimedia Action API",
        "license": LICENSE,
        "license_url": LICENSE_URL,
        "changes": "Draw-to-entrant facts mapped onto existing Cagematch wrestler records; result and elimination data preserved.",
        "entrant_count": len(match.entrants),
    }
    return payload


def regenerate(data_directory: Path, years: Iterable[int]) -> tuple[list[int], dict[int, str]]:
    client = WikimediaClient()
    updated: list[int] = []
    skipped: dict[int, str] = {}
    for year in years:
        path = data_directory / f"{year}.json"
        if not path.exists():
            skipped[year] = "no existing match file"
            continue
        payload = json.loads(path.read_text())
        try:
            matches = client.annual_matches(year)
            match = select_open_match(matches, payload.get("wrestlers", []))
            updated_payload = apply_match(payload, match)
        except Exception as error:  # fail closed per year; keep original file
            skipped[year] = str(error)
            print(f"SKIP {year}: {error}")
            continue
        path.write_text(json.dumps(updated_payload, indent=4, ensure_ascii=False) + "\n")
        updated.append(year)
        print(f"UPDATED {year}: revision {match.revision_id}, {len(match.entrants)} entrants")
    return updated, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=Path("data/matches"))
    parser.add_argument("--start-year", type=int, default=1988)
    parser.add_argument("--end-year", type=int, default=2026)
    arguments = parser.parse_args()
    updated, skipped = regenerate(
        arguments.data_dir, range(arguments.start_year, arguments.end_year + 1)
    )
    print(json.dumps({"updated": updated, "skipped": skipped}, indent=2))
    if skipped:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
