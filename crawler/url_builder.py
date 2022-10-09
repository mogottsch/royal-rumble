from datetime import date
from urllib.parse import quote

BASE_URL = "https://www.cagematch.net/"

EVENT_SEARCH = BASE_URL + "?id=1&view=search"

EVENT_NAME_ROYAL_RUMBLE = "Royal Rumble"


def build_event_search_url(event_name: str, date_from: date, date_till: date):
    url = EVENT_SEARCH
    url += "&sEventName=" + quote(event_name)
    url += "&sDateFromDay=" + str(date_from.day)
    url += "&sDateFromMonth=" + str(date_from.month)
    url += "&sDateFromYear=" + str(date_from.year)
    url += "&sDateTillDay=" + str(date_till.day)
    url += "&sDateTillMonth=" + str(date_till.month)
    url += "&sDateTillYear=" + str(date_till.year)
    return url


def build_royal_rumble_event_search_url(year: int):
    date_from = date(year, 1, 1)
    date_till = date(year, 12, 31)
    return build_event_search_url(EVENT_NAME_ROYAL_RUMBLE, date_from, date_till)


def attach_to_base_url(url: str):
    return BASE_URL + url
