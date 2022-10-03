package models

import (
	"testing"
)

func TestCreateLobby(t *testing.T) {
	loadFixturesOrPanic()
	lobby, err := lobbyRepo.CreateLobby()
	if err != nil {
		t.Errorf("Error creating lobby: %v", err)
		return
	}
	if lobby.ID == 0 || lobby.Code == "" {
		t.Errorf("Lobby not created properly %v", lobby)
	}
}

func TestFindLobbyByCode(t *testing.T) {
	loadFixturesOrPanic()
	lobby, err := lobbyRepo.FindLobbyByCode("ABC123")
	if err != nil {
		t.Errorf("Error finding lobby: %v", err)
		return
	}
	if lobby.ID == 0 || lobby.Code == "" {
		t.Errorf("Lobby not found properly %v", lobby)
	}
}
