package models

import (
	"github.com/gin-gonic/gin"
	"github.com/mogottsch/royal/middleware"
	"gorm.io/gorm"
)

type User struct {
	Model
	Name          string         `json:"name"`
	SessionID     string         `json:"-"`
	UserInLobbies []*UserInLobby `json:"user_in_lobbies,omitempty"`
}

// type UserResource struct {
// 	id   uint
// 	name string
// }

// func (user User) ToResource() gin.H {
// 	resource := gin.H{
// 		"id":   user.ID,
// 		"name": user.Name,
// 	}
//
// 	if user.UserInLobbies != nil {
// 		lobbies := make([]gin.H, 0, len(user.UserInLobbies))
// 		for _, userInLobby := range user.UserInLobbies {
// 			if userInLobby.Lobby.ID == 0 {
// 				continue
// 			}
// 			lobbies = append(lobbies, userInLobby.Lobby.ToResource())
// 		}
//
// 		if len(lobbies) > 0 {
// 			resource["lobbies"] = lobbies
// 		}
// 	}
//
// 	return resource
//
// }

func NewUser(name string, sessionID string) *User {
	return &User{Name: name, SessionID: sessionID}
}

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) UserRepo {
	return UserRepo{db: db}
}

func (userRepo UserRepo) AddUserToLobby(user *User, lobby *Lobby, asHost bool) error {
	userRepo.db.Preload("UserInLobbies.Lobby").First(user, user.ID)
	userRepo.db.Preload("UserInLobbies.User").First(lobby, lobby.ID)

	for _, userInLobby := range user.UserInLobbies {
		if userInLobby.Lobby.ID == lobby.ID {
			return nil
		}
	}

	userInLobby := &UserInLobby{
		User:   user,
		Lobby:  lobby,
		IsHost: asHost,
	}
	result := userRepo.db.Create(userInLobby)
	if result.Error != nil {
		return result.Error
	}

	// reload relationships
	userRepo.db.Preload("UserInLobbies.Lobby").First(user, user.ID)
	userRepo.db.Preload("UserInLobbies.User").First(lobby, lobby.ID)

	return nil
}

func (userRepo UserRepo) CreateUser(name string, sessionID string) (*User, error) {
	user := NewUser(name, sessionID)
	result := userRepo.db.Create(&user)
	if result.Error != nil {
		return user, result.Error
	}
	return user, nil
}

func (userRepo UserRepo) FindUserBySessionID(sessionID string) (*User, error) {
	var user User
	// result := userRepo.db.Preload("UserInLobbies.Lobby").Where("session_id = ?", sessionID).First(&user)
	result := userRepo.db.Where("session_id = ?", sessionID).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func (userRepo UserRepo) LoadLobbies(user *User) error {
	result := userRepo.db.Preload("UserInLobbies.Lobby").First(user, user.ID)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

func (userRepo UserRepo) ResolveUser(c *gin.Context) (*User, bool) {
	sessionID, exists := middleware.GetSessionID(c)
	if !exists {
		return nil, false
	}
	user, err := userRepo.FindUserBySessionID(sessionID)
	if err != nil {
		return user, false
	}
	return user, true
}
