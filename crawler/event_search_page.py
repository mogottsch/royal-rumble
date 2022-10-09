import urllib.request
from bs4 import BeautifulSoup
from url_builder import attach_to_base_url, build_royal_rumble_event_search_url
from config import headers


def fetch_event_search_page(year: int):
    url = build_royal_rumble_event_search_url(year)

    with urllib.request.urlopen(
        urllib.request.Request(url, headers=headers)
    ) as response:
        return response.read()


def build_event_search_page_soup(year: int):
    return BeautifulSoup(fetch_event_search_page(year), "html.parser")


def extract_result_entry(row):
    last_td = row.find_all("td")[-1]
    score = 0
    try:
        score = float(last_td.contents[0])
    except TypeError:
        pass
    except ValueError:
        pass

    anchors = row.find_all("a")
    a = anchors[1]
    title = a.contents[0]
    url = a["href"]
    return {"title": title, "url": url, "score": score}


def get_royal_rumble_event_url(year: int):
    soup = build_event_search_page_soup(year)
    results_table = soup.find("table", {"class": "TBase"})
    if results_table is None:
        raise Exception("No results table found")
    rows = results_table.find_all("tr")

    results = []
    for row in rows[1:]:
        results.append(extract_result_entry(row))

    results.sort(key=lambda x: x["score"], reverse=True)
    return attach_to_base_url(results[0]["url"])
