package models

import (
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/mogottsch/royal/middleware"
	"gorm.io/gorm"
)

var dbG *gorm.DB
var fixtures *testfixtures.Loader
var userRepo UserRepo
var lobbyRepo LobbyRepo

func TestMain(m *testing.M) {
	var err error
	dbG, fixtures, err = SetupTesting()
	if err != nil {
		panic(err)
	}

	userRepo = NewUserRepo(dbG)
	lobbyRepo = NewLobbyRepo(dbG)

	os.Exit(m.Run())
}

func loadFixturesOrPanic() {
	err := fixtures.Load()
	if err != nil {
		panic(err)
	}
}

func TestFixtures(t *testing.T) {
	loadFixturesOrPanic()
	var users []User
	dbG.Find(&users)
	if len(users) != 2 {
		t.Errorf("Unexpected number of users: %v", len(users))
	}
}

func TestAddUserToLobby(t *testing.T) {
	loadFixturesOrPanic()

	user, err := userRepo.CreateUser("TestUser", "TestSessionID")
	if err != nil {
		t.Errorf("Error creating user: %v", err)
	}

	var lobby Lobby
	dbG.First(&lobby)

	if lobby.ID == 0 {
		t.Errorf("No lobby found")
	}

	err = userRepo.AddUserToLobby(user, &lobby)

	if err != nil {
		t.Errorf("Error adding user to lobby: %v", err)
	}

	userRepo.LoadLobbies(user)
	var usersLobbies []*Lobby
	for _, userInLobby := range user.UserInLobbies {
		usersLobbies = append(usersLobbies, userInLobby.Lobby)
	}

	if len(usersLobbies) != 1 {
		t.Errorf("Expected 1 lobby, got %v", len(usersLobbies))
	}
	if usersLobbies[0].ID != lobby.ID {
		t.Errorf("Expected lobby with id %v, got %v", lobby.ID, usersLobbies[0].ID)
	}
}

func TestResolveUser(t *testing.T) {
	loadFixturesOrPanic()
	c, _ := gin.CreateTestContext(nil)
	var user User
	dbG.First(&user)
	c.Set(middleware.SessionIDKey, user.SessionID)
	resolvedUser, exists := userRepo.ResolveUser(c)
	if !exists {
		t.Errorf("Expected user to exist")
	}
	if resolvedUser.ID != user.ID {
		t.Errorf("Expected user with id %v, got %v", user.ID, resolvedUser.ID)
	}
}
