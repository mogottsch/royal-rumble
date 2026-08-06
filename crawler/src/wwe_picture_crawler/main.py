import io
import urllib.parse
from bs4 import BeautifulSoup
from pathlib import Path
from PIL import Image, PngImagePlugin, UnidentifiedImageError
import aiohttp
import aiofiles
import asyncio
from aiohttp import ClientSession
from pathvalidate import sanitize_filename
import json


BASE_URL = "https://www.wwe.com"
SUPERSTARS_URL = "https://www.wwe.com/api/superstars"
WWE_SEARCH_URL = "https://search.wwe.com/api/v1/category?term={search_term}&device=web&country=in&sub_level=1&page=1&category=Superstars"
ROOT_DIR = Path(__file__).resolve().parent.parent.parent


def get_wwe_search_url(search_term: str) -> str:
    escaped_search_term = urllib.parse.quote(search_term)
    return WWE_SEARCH_URL.format(search_term=escaped_search_term)


def retrieve_first_search_result_url(search_results: dict) -> str:
    group = search_results["groups"][0]["group"]
    return group["items"][0]["url"]


def get_picture_url(soup: BeautifulSoup) -> str:
    relative_url = (
        soup.find("div", class_="wwe-talent__hero--img")
        .find("picture")
        .find("img")["srcset"]
        .split(" ")[0]
    )
    assert relative_url is not None
    return BASE_URL + relative_url


async def read_names():
    async with aiofiles.open(ROOT_DIR / "data/names.txt") as f:
        content = await f.read()
        return content.splitlines()


async def search_and_download_with_session(
    session: ClientSession, search_term: str, file_path: Path
):
    url = get_wwe_search_url(search_term)
    search_results = await fetch_json_with_session(session, url)
    first_search_result_url = retrieve_first_search_result_url(search_results)
    soup = await fetch_soup_with_session(session, first_search_result_url)
    picture_url = get_picture_url(soup)
    await download_image_to_file_with_session(session, picture_url, file_path)


async def fetch_json_with_session(session: ClientSession, url: str) -> dict:
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.json()


async def fetch_soup_with_session(session: ClientSession, url: str) -> BeautifulSoup:
    async with session.get(url) as response:
        response.raise_for_status()
        html = await response.text()
        return BeautifulSoup(html, "html.parser")


def is_supported_image(content: bytes) -> bool:
    if not content or len(content) > 20 * 1024 * 1024:
        return False
    PngImagePlugin.MAX_TEXT_CHUNK = 64 * 1024 * 1024
    PngImagePlugin.MAX_TEXT_MEMORY = 128 * 1024 * 1024
    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
            return image.format in {"PNG", "JPEG", "GIF", "WEBP"}
    except (UnidentifiedImageError, OSError, ValueError):
        return False


async def download_image_to_file_with_session(
    session: ClientSession, url: str, file_path: Path
) -> None:
    async with session.get(url) as response:
        response.raise_for_status()
        content = await response.read()

    if not is_supported_image(content):
        raise ValueError(f"Downloaded content from {url} is not a supported image")

    file_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = file_path.with_suffix(file_path.suffix + ".part")
    try:
        async with aiofiles.open(temporary_path, mode="wb") as image_file:
            await image_file.write(content)
        temporary_path.replace(file_path)
    finally:
        temporary_path.unlink(missing_ok=True)


async def fetch_superstars(session: ClientSession) -> dict:
    return await fetch_json_with_session(session, SUPERSTARS_URL)


async def start():
    (ROOT_DIR / "data" / "images").mkdir(parents=True, exist_ok=True)

    async with aiohttp.ClientSession() as session:
        superstars = await fetch_superstars(session)
        saved_superstars = []
        for superstar in superstars["talent"]:
            name = sanitize_filename(superstar["name"])
            file_name = f"{name}.png"
            file_path = ROOT_DIR / "data" / "images" / file_name

            if file_path.exists() and is_supported_image(file_path.read_bytes()):
                print(f"Skipping {name} as a validated file already exists")
                saved_superstars.append(
                    {
                        "name": name,
                        "file_name": file_name,
                    }
                )
                continue

            file_path.unlink(missing_ok=True)
            try:
                superstar_link = BASE_URL + superstar["link"]
                soup = await fetch_soup_with_session(session, superstar_link)
                picture_url = get_picture_url(soup)
                await download_image_to_file_with_session(
                    session, picture_url, file_path
                )

                saved_superstars.append(
                    {
                        "name": name,
                        "file_name": file_name,
                    }
                )
                print(f"Downloaded {name}")
            except Exception as e:
                print(f"Failed to download {name}: {e}")
                saved_superstars.append(
                    {
                        "name": name,
                        "file_name": None,
                    }
                )

    with open(ROOT_DIR / "data/saved_superstars.json", "w") as f:
        json.dump(saved_superstars, f, indent=2)


def main():
    asyncio.run(start())
