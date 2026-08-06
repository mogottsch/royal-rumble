import base64
from pathlib import Path

import pytest
from bs4 import BeautifulSoup

from royal_rumble_crawler import all_wrestlers
from royal_rumble_crawler.royal_rumble_match_page import (
    Wrestler,
    extract_wrestlers,
)
from wwe_picture_crawler.main import download_image_to_file_with_session


class FakeResponse:
    def __init__(self, *, status: int = 200, content: bytes = b""):
        self.status = status
        self._content = content

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return None

    def raise_for_status(self):
        if self.status >= 400:
            raise RuntimeError(f"HTTP {self.status}")

    async def read(self):
        return self._content


class FakeSession:
    def __init__(self, response: FakeResponse):
        self.response = response

    def get(self, _url):
        return self.response


def test_extract_wrestlers_keeps_source_identity_without_inventing_entrance_number():
    results = BeautifulSoup(
        '<a href="?id=2&nr=123&name=Test">Test Wrestler</a>',
        "html.parser",
    ).contents

    [wrestler] = extract_wrestlers(results)

    assert wrestler.name == "Test Wrestler"
    assert wrestler.cm_id == 123
    assert wrestler.entrance_number is None
    assert "entrance_number" not in wrestler.__dict__()


def test_wrestler_schema_accepts_verified_entrance_number_additively():
    wrestler = Wrestler("Verified Wrestler", 123, __import__("uuid").uuid4(), 7)
    assert wrestler.__dict__()["entrance_number"] == 7


def test_all_wrestler_pages_are_written_below_crawler_data():
    path = all_wrestlers.get_page_filepath(3)
    assert path.name == "page_3.txt"
    assert path.parent.name == "all_wrestlers"
    assert path.parent.parent.name == "data"


@pytest.mark.asyncio
async def test_download_is_atomic_and_rejects_failed_responses(tmp_path: Path):
    target = tmp_path / "image.png"
    with pytest.raises(RuntimeError, match="HTTP 404"):
        await download_image_to_file_with_session(
            FakeSession(FakeResponse(status=404)), "https://example.invalid/image", target
        )
    assert not target.exists()
    assert not target.with_suffix(".png.part").exists()


@pytest.mark.asyncio
async def test_download_records_only_a_valid_image(tmp_path: Path):
    target = tmp_path / "nested" / "image.png"
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    await download_image_to_file_with_session(
        FakeSession(FakeResponse(content=png)), "https://example.invalid/image", target
    )
    assert target.read_bytes() == png
    assert not target.with_suffix(".png.part").exists()


@pytest.mark.asyncio
async def test_download_rejects_non_image_content(tmp_path: Path):
    target = tmp_path / "image.png"
    with pytest.raises(ValueError, match="not a supported image"):
        await download_image_to_file_with_session(
            FakeSession(FakeResponse(content=b"<html>not an image</html>")),
            "https://example.invalid/image",
            target,
        )
    assert not target.exists()
