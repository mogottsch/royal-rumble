package models

type UserInLobby struct {
	Model
	UserID             uint      `json:"user_id"`
	User               *User     `json:"user,omitempty"`
	LobbyID            uint      `json:"lobby_id"`
	Lobby              *Lobby    `json:"lobby,omitempty"`
	IsHost             bool      `json:"is_host"`
	WrestlerID         uint      `json:"wrestler_id"`
	Wrestler           *Wrestler `json:"wrestler,omitempty"`
	NextEntranceNumber uint8     `json:"next_entrance_number"`
}

func (UserInLobby) TableName() string {
	return "users_in_lobbies"
}
