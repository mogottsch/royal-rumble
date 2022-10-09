import urllib.request
from bs4 import BeautifulSoup
from config import headers


def fetch_wrestler_profile(url: str):
    with urllib.request.urlopen(
        urllib.request.Request(url, headers=headers)
    ) as response:
        return response.read()


def build_wrestler_profile_soup(url: str):
    return BeautifulSoup(fetch_wrestler_profile(url), "html.parser")


def extract_wrestler_profile(wrestler_profile_soup):
    profile = {}
    profile["name"] = wrestler_profile_soup.find("h1").contents[0]
    gender_div = wrestler_profile_soup.find(
        lambda tag: tag.name == "div"
        and "Gender" in tag.text
        and tag.get("class") == ["InformationBoxTitle"]
    )
    gender = gender_div.next_sibling.contents[0]
    profile["gender"] = gender

    return profile


def get_wrestler_profile(url):
    return extract_wrestler_profile(build_wrestler_profile_soup(url))
