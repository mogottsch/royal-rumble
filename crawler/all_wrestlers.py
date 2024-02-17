import os
import asyncio
import re
import aiohttp

from bs4 import BeautifulSoup
import config
from joblib import Memory
from aiohttp import ClientSession

memory = Memory("cachedir")


# @memory.cache
async def fetch(session, page: int = 0) -> bytes:
    offset = page * 100
    url = f"https://www.cagematch.net/?id=2&view=workers&s={offset}"
    async with session.get(url, headers=config.headers) as response:
        return await response.read()


def extract_rows_from_page(content):
    soup = BeautifulSoup(content, "html.parser")
    first_table = soup.find_all("table")[0]
    return first_table.find_all("tr", class_=re.compile(r"TRow1|TRow2"))


def extract_wrestler_name(row):
    name_td = row.find_all("td")[1]
    name_a = name_td.find("a")
    name = name_a.text

    return name


def save_wrestlers_to_file(wrestlers, filename):
    with open(filename, "w") as file:
        for wrestler in wrestlers:
            file.write(wrestler + "\n")


DATA_DIR = "all_wrestlers"


def get_page_filepath(page: int) -> str:
    return os.path.join(DATA_DIR, f"page_{page}.txt")


async def process_page(session, page: int):
    filepath = get_page_filepath(page)
    if os.path.exists(filepath):
        return
    print(f"Processing page {page}")
    content = await fetch(session, page)
    rows = extract_rows_from_page(content)
    wrestlers = [extract_wrestler_name(row) for row in rows]
    save_wrestlers_to_file(wrestlers, filepath)


last_page = 288


async def main():
    async with ClientSession(connector=aiohttp.TCPConnector(limit=20)) as session:
        tasks = [process_page(session, page) for page in range(last_page)]
        await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
