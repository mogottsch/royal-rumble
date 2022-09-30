package models

import (
	"gorm.io/gorm"
)

type Status int64

const (
	Active Status = iota
	Eliminated
)

type Wrestler struct {
	gorm.Model
	LobbyID        uint
	Lobby          Lobby
	Status         Status
	EntranceNumber uint8
}
