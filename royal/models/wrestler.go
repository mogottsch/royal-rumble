package models

type Status int64

const (
	Active Status = iota
	Eliminated
)

type Wrestler struct {
	Model
	LobbyID        uint
	Lobby          *Lobby
	Status         Status
	EntranceNumber uint8
}
