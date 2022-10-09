import os
from event_search_page import get_royal_rumble_event_url
from royal_rumble_match_page import (
    extract_eliminations,
    get_royal_rumble_match_tag,
    build_royal_rumble_event_page_soup,
    extract_wrestlers,
    store_match_json,
)

years = range(1988, 2023)

for year in years:
    path = f"matches/{year}.json"

    if os.path.exists(path):
        print(f"Skipping {year} because file already exists")
        continue

    # print(get_royal_rumble_event_url(year))
    rr_match_tag = get_royal_rumble_match_tag(
        build_royal_rumble_event_page_soup(get_royal_rumble_event_url(year))
    )
    wrestlers = extract_wrestlers(rr_match_tag["results"])
    eliminations = extract_eliminations(rr_match_tag["notes"], wrestlers)

    store_match_json(wrestlers, eliminations, path)
    print(f"Stored {year}.json")
