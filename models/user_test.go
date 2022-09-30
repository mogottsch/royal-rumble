package models

import (
	"fmt"
	"os"
	"testing"

	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/mogottsch/royal/db"
	"gorm.io/gorm"
)

var dbG *gorm.DB

func TestMain(m *testing.M) {
	schema := GetSchema()
	var err error
	dbG, err = db.Setup(schema)
	if err != nil {
		panic("failed to connect database")
	}

	dbInstance, err := dbG.DB()
	if err != nil {
		panic(err)
	}

	fixtures, err := testfixtures.New(
		testfixtures.Database(dbInstance),
		testfixtures.Dialect("sqlite"),
		testfixtures.Directory("../fixtures"),
	)
	if err != nil {
		panic(err)
	}

	err = fixtures.Load()
	if err != nil {
		panic(err)
	}
	os.Exit(m.Run())
}

func TestJoinLobby(t *testing.T) {

	user := &User{Name: "Gunther"}
	result := dbG.Create(user)
	if result.Error != nil {
		t.Error(result.Error)
	}

	var lobby Lobby

	dbG.First(&lobby)

	user.JoinLobby(dbG, &lobby)

	// Assert
	result = dbG.First(&user, user.ID)
	if result.Error != nil {
		t.Error(result.Error)
	}
	result = dbG.First(&lobby, lobby.ID)
	if result.Error != nil {
		t.Error(result.Error)
	}

	var userInLobby1 UserInLobby
	err := dbG.Model(&user).Association("UserInLobbies").Find(&userInLobby1)
	if err != nil {
		t.Error(err)
	}

	var usersInLobby []UserInLobby
	var userInLobby2 UserInLobby
	err = dbG.Model(&lobby).Association("UserInLobbies").Find(&usersInLobby)
	for _, userInLobby := range usersInLobby {
		if userInLobby.UserID == user.ID {
			userInLobby2 = userInLobby
		}
	}

	if err != nil {
		t.Error(err)
	}

	if userInLobby1.ID != userInLobby2.ID {
		t.Error(fmt.Sprintf(
			"userInLobby1.ID != userInLobby2.ID: %d != %d",
			userInLobby1.ID,
			userInLobby2.ID),
		)
	}

}
