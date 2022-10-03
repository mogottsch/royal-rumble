package models

import (
	"gorm.io/gorm"

	"math/rand"
)

const LOBBY_CODE_LENGTH = 6

type Lobby struct {
	Model
	UserInLobbies []*UserInLobby `json:"user_in_lobbies,omitempty"`
	Code          string         `gorm:"uniqueIndex" json:"code"`
}

// type LobbyResource struct {
// 	id   uint
// 	code string
// }

// func (lobby Lobby) ToResource() gin.H {
// 	resource := gin.H{
// 		"id":   lobby.ID,
// 		"code": lobby.Code,
// 	}
// 	return resource
//
// }

func NewLobby() *Lobby {
	return &Lobby{Code: randSeq(LOBBY_CODE_LENGTH)}
}

type LobbyRepo struct {
	db *gorm.DB
}

func NewLobbyRepo(db *gorm.DB) LobbyRepo {
	return LobbyRepo{db: db}
}

func (lobbyRepo LobbyRepo) CreateLobby() (*Lobby, error) {
	lobby := NewLobby()
	err := lobbyRepo.db.Create(lobby).Error
	return lobby, err
}

var letters = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func (lobbyRepo LobbyRepo) FindLobbyByCode(code string) (*Lobby, error) {
	var lobby Lobby
	err := lobbyRepo.db.Where("code = ?", code).First(&lobby).Error
	return &lobby, err
}

func (lobbyRepo LobbyRepo) LoadUsers(lobby *Lobby) error {
	result := lobbyRepo.db.Preload("UserInLobbies.User").First(lobby, lobby.ID)
	if result.Error != nil {
		return result.Error
	}
	return nil
}