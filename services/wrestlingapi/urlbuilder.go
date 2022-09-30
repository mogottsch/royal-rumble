package wrestlingapi

// https://www.cagematch.net/?id=1&view=search&sEventName=royal+rumble&sPromotion=&sDateFromDay=01&sDateFromMonth=01&sDateFromYear=2017&sDateTillDay=31&sDateTillMonth=12&sDateTillYear=2022&sRegion=&sEventType=&sLocation=&sArena=&sAny=

const BaseURL = "https://www.cagematch.net/"
const EventSearchID = 1
const MatchSearchID = 111

type URLBuilder interface {
	BuildURL() string
}

type EventSearchURLBuilder struct {
	URLBuilder
}
