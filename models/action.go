package models

import (
	"gorm.io/gorm"
)

type Action struct {
	gorm.Model
	LobbyID     uint
	Lobby       Lobby
	Description string
}
