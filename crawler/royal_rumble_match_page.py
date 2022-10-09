import os
from typing import List
import urllib.request
from urllib import parse
from bs4 import BeautifulSoup
from url_builder import attach_to_base_url, build_royal_rumble_event_search_url
from wrestler_page import get_wrestler_profile
from config import headers
import re
import uuid
import json


def fetch_royal_rumble_event_page(url: str):
    with urllib.request.urlopen(
        urllib.request.Request(url, headers=headers)
    ) as response:
        return response.read()


def build_royal_rumble_event_page_soup(url: str):
    return BeautifulSoup(fetch_royal_rumble_event_page(url), "html.parser")


def extract_match_entry(match_element):
    match_type = "".join(
        str(match_element.find("div", {"class": "MatchType"}).contents)
    )
    match_results = match_element.find("div", {"class": "MatchResults"})
    match_notes = match_element.find("div", {"class": "MatchNotes"})

    return {
        "type": match_type,
        "results": match_results.contents if match_results else None,
        "notes": match_notes.contents if match_notes else None,
    }


# class RoyalRumbleMatch:


def get_royal_rumble_match_tag(soup):
    match_elements = soup.find_all("div", {"class": "Match"})
    rr_matches = []
    for match_element in match_elements:
        match = extract_match_entry(match_element)
        if (
            "Royal Rumble Match" in match["type"]
            and match["results"]
            and match["notes"]
        ):
            rr_matches.append(match)

    if len(rr_matches) == 0:
        raise Exception("No Royal Rumble matches found")

    if len(rr_matches) == 1:
        return rr_matches[0]

    for match in rr_matches:
        winner_anchor = match["results"][0]

        profile = get_wrestler_profile(attach_to_base_url(winner_anchor["href"]))
        if profile["gender"] == "female":
            continue
        return match

    raise Exception("No male Royal Rumble matches found")


# ?id=2&amp;nr=2250&amp;name=Seth+Rollins
def extract_cm_id_from_url(url):
    parsed = parse.urlparse(url)
    query = parse.parse_qs(parsed.query)
    return int(query["nr"][0])


class Wrestler:
    name: str
    cm_id: int
    id: uuid.UUID

    def __init__(self: "Wrestler", name: str, cm_id: int, id: uuid.UUID):
        self.name = name
        self.cm_id = cm_id
        self.id = id

    def __repr__(self):
        return f"Wrestler(name={self.name}, cm_id={self.cm_id})"

    def __str__(self):
        return self.__repr__()

    def __dict__(self):
        return {
            "name": self.name,
            "cm_id": self.cm_id,
            "id": str(self.id),
        }


def extract_wrestlers(results):
    wrestlers = []

    for result in results:
        if result.name != "a":
            continue
        name = result.contents[0]
        cm_id = extract_cm_id_from_url(result["href"])

        wrestlers.append(Wrestler(name, cm_id, uuid.uuid4()))

    return wrestlers


class Elimination:
    offenders: List[uuid.UUID]
    victims: List[uuid.UUID]
    raw: str
    is_valid = True

    def __init__(
        self: "Elimination",
        offenders: List[uuid.UUID],
        victims: List[uuid.UUID],
        raw: str,
        is_valid: bool = True,
    ):
        self.offenders = offenders
        self.victims = victims
        self.raw = raw
        self.is_valid = is_valid

    def __repr__(self):
        return f"{self.offenders} => {self.victims} \n {self.raw}"

    def __str__(self):
        return self.__repr__()

    def __dict__(self):
        return {
            "offenders": [str(offender) for offender in self.offenders],
            "victims": [str(victim) for victim in self.victims],
            "raw": self.raw,
            "is_valid": self.is_valid,
        }


split_elimination_words = [
    " eliminates ",
    " eliminate ",
    " elimineren ",
    " eliminiert ",
    " eliminiert",
    " disqualifiziert",
    " eliminiern ",
    " eliminated",
]

split_and_words = [
    " and ",
    " und ",
    " & ",
    " , ",
]


def extract_eliminations(notes, wrestlers: List[Wrestler]) -> List[Elimination]:
    eliminations = []

    for note in notes:
        if note.name == "br":
            continue

        pair = []
        for word in split_elimination_words:
            if word in note:
                pair = note.split(word)
                break

        if len(pair) != 2:
            raise Exception(f"Could not split elimination: {note}")

        offenders, victims = pair
        offenders = offenders[2:]

        if "sich selbst" in victims or "gegenseitig" in victims:
            victims = offenders

        victims = re.sub(r"\s\(\d+:\d+\)", "", victims)

        for word in split_and_words:
            if word in victims:
                victims = victims.replace(word, ",")
            if word in offenders:
                offenders = offenders.replace(word, ",")

        offenders = offenders.split(",")
        victims = victims.split(",")

        offenders = [offender.strip() for offender in offenders]
        victims = [victim.strip() for victim in victims]

        # print(offenders, " => ", victims)

        offenders_ids = [
            wrestler.id for wrestler in wrestlers if wrestler.name in offenders
        ]
        victims_ids = [
            wrestler.id for wrestler in wrestlers if wrestler.name in victims
        ]

        # print(offenders, " => ", victims)

        is_valid = (
            (len(offenders_ids) == len(offenders))
            and len(victims_ids) == len(victims)
            and len(offenders_ids) > 0
            and len(victims_ids) > 0
        )

        eliminations.append(Elimination(offenders_ids, victims_ids, note, is_valid))

    return eliminations


def store_match_json(wrestlers: List[Wrestler], eliminations: List[Elimination], path):
    match = {
        "wrestlers": [w.__dict__() for w in wrestlers],
        "eliminations": [e.__dict__() for e in eliminations],
    }

    with open(path, "w") as f:
        json.dump(match, f, indent=4)
