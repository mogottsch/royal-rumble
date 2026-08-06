import json
from pathlib import Path

import pytest

from royal_rumble_crawler.entrance_order import (
    Entrant,
    SourceMatch,
    apply_match,
    parse_entrance_table,
    select_open_match,
    validate_draws,
)

FIXTURES = Path(__file__).parent / "fixtures"
DATA = Path(__file__).parents[1] / "data" / "matches"


def test_1988_fixture_uses_draw_not_result_order():
    entrants = parse_entrance_table((FIXTURES / "1988-entrances.html").read_text())
    assert len(entrants) == 20
    assert entrants[0] == Entrant(1, "Bret Hart")
    assert entrants[12] == Entrant(13, "Jim Duggan")


def test_2025_mens_fixture_includes_substitution_and_known_edges():
    entrants = parse_entrance_table((FIXTURES / "2025-men-entrances.html").read_text())
    assert len(entrants) == 30
    assert entrants[0] == Entrant(1, "Rey Mysterio")
    assert entrants[7] == Entrant(8, "IShowSpeed")
    assert entrants[-1] == Entrant(30, "Logan Paul")


def test_mapping_preserves_existing_objects_and_eliminations():
    payload = json.loads((DATA / "1988.json").read_text())
    original_ids = [entry["id"] for entry in payload["wrestlers"]]
    original_eliminations = payload["eliminations"]
    entrants = parse_entrance_table((FIXTURES / "1988-entrances.html").read_text())
    mapped = apply_match(
        payload,
        SourceMatch(1988, "Royal Rumble entrances and eliminations", 123, "https://example.test", tuple(entrants)),
    )
    assert [entry["id"] for entry in mapped["wrestlers"]] == original_ids
    assert mapped["eliminations"] == original_eliminations
    assert mapped["entrance_order"]["source_revision_id"] == 123


def test_draw_validation_fails_closed():
    with pytest.raises(ValueError, match="non-contiguous"):
        validate_draws([Entrant(1, "One"), Entrant(3, "Three")])


def source_match(label: str, entrants: tuple[Entrant, ...]) -> SourceMatch:
    return SourceMatch(2025, label, 1, "https://example.test", entrants)


def test_select_open_match_excludes_women_and_chooses_unique_best_overlap():
    existing = [{"name": "Alpha"}, {"name": "Beta"}]
    women = source_match("Women's Royal Rumble entrances", (Entrant(1, "Alpha"), Entrant(2, "Beta")))
    men = source_match("Men's Royal Rumble entrances", (Entrant(1, "Alpha"), Entrant(2, "Other")))

    assert select_open_match([women, men], existing) is men


def test_select_open_match_rejects_equal_ranked_candidates():
    existing = [{"name": "Alpha"}]
    first = source_match("Open match one", (Entrant(1, "Alpha"),))
    second = source_match("Open match two", (Entrant(1, "Alpha"),))

    with pytest.raises(ValueError, match="ambiguous"):
        select_open_match([first, second], existing)
