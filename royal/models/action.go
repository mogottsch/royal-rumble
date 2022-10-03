package models

type Action struct {
	Model
	LobbyID     uint   `json:"lobby_id"`
	Lobby       Lobby  `json:"lobby,omitempty"`
	Description string `json:"description"`
}
