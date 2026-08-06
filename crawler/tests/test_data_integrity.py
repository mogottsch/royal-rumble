import json
from pathlib import Path

from PIL import Image, PngImagePlugin


CRAWLER_ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = CRAWLER_ROOT / "data"


def is_supported_image(path: Path) -> bool:
    if not 0 < path.stat().st_size <= 20 * 1024 * 1024:
        return False
    PngImagePlugin.MAX_TEXT_CHUNK = 64 * 1024 * 1024
    PngImagePlugin.MAX_TEXT_MEMORY = 128 * 1024 * 1024
    try:
        with Image.open(path) as image:
            image.verify()
            return image.format in {"PNG", "JPEG", "GIF", "WEBP"}
    except (OSError, ValueError):
        return False


def test_saved_superstar_manifest_references_existing_valid_images():
    records = json.loads((DATA_ROOT / "saved_superstars.json").read_text())
    assert isinstance(records, list) and records

    for record in records:
        assert isinstance(record.get("name"), str) and record["name"].strip()
        file_name = record.get("file_name")
        if file_name is None:
            continue
        image_path = DATA_ROOT / "images" / file_name
        assert image_path.is_file(), f"Missing image for {record['name']}: {file_name}"
        assert is_supported_image(image_path), f"Invalid image for {record['name']}: {file_name}"


def test_match_files_have_parseable_compatible_schema():
    files = sorted((DATA_ROOT / "matches").glob("[0-9][0-9][0-9][0-9].json"))
    assert files
    legacy = json.loads((DATA_ROOT / "matches" / "legacy-unverified-years.json").read_text())["years"]

    for path in files:
        payload = json.loads(path.read_text())
        wrestlers = payload.get("wrestlers")
        assert isinstance(wrestlers, list), f"{path.name}: wrestlers must be a list"
        explicit_numbers = []
        for wrestler in wrestlers:
            assert isinstance(wrestler.get("name"), str) and wrestler["name"].strip()
            assert wrestler.get("cm_id") is None or isinstance(wrestler["cm_id"], int)
            if "entrance_number" in wrestler:
                number = wrestler["entrance_number"]
                assert isinstance(number, int) and 1 <= number <= 100
                explicit_numbers.append(number)
        assert len(explicit_numbers) == len(set(explicit_numbers)), (
            f"{path.name}: explicit entrance numbers must be unique"
        )

        year = path.stem
        order = payload.get("entrance_order")
        if year in legacy:
            assert order is None
            assert explicit_numbers == []
            continue

        assert order["status"] == "verified"
        assert order["source_url"] == f"https://en.wikipedia.org/wiki/Royal_Rumble_({year})"
        assert isinstance(order["source_revision_id"], int) and order["source_revision_id"] > 0
        assert order["license"] == "CC BY-SA 4.0"
        assert order["entrant_count"] == len(explicit_numbers)
        assert sorted(explicit_numbers) == list(range(1, len(explicit_numbers) + 1))


def test_known_verified_positions():
    expected = {
        1988: {"Bret Hart": 1, "Jim Duggan": 13},
        2025: {"Rey Mysterio": 1, "Logan Paul": 30},
    }
    for year, positions in expected.items():
        payload = json.loads((DATA_ROOT / "matches" / f"{year}.json").read_text())
        actual = {entry["name"]: entry.get("entrance_number") for entry in payload["wrestlers"]}
        for name, number in positions.items():
            assert actual[name] == number
