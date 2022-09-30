package models

import (
	"gorm.io/gorm"
)

type UserInLobby struct {
	gorm.Model
	UserID             uint
	User               User
	LobbyID            uint
	Lobby              Lobby
	WrestlerID         uint
	Wrestler           Wrestler
	NextEntranceNumber uint8
}

func (UserInLobby) TableName() string {
	return "users_in_lobbies"
}
