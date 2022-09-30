package models

import (
	"github.com/gin-gonic/gin"
	"github.com/mogottsch/royal/middleware"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
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

func NewUser(name string, sessionID string) User {
	return User{Name: name, SessionID: sessionID}
}

type UserRepo struct {
	db *gorm.DB
}

func NewUserRepo(db *gorm.DB) UserRepo {
	return UserRepo{db: db}
}

func (userRepo UserRepo) AddUserToLobby(user *User, lobby *Lobby) error {
	userInLobby := &UserInLobby{
		User:  user,
		Lobby: lobby,
	}
	result := userRepo.db.Create(userInLobby)
	if result.Error != nil {
		return result.Error
	}

	// reload relationships
	userRepo.db.Preload("UserInLobbies").First(user, user.ID)
	userRepo.db.Preload("UserInLobbies").First(lobby, lobby.ID)

	return nil
}

func (userRepo UserRepo) CreateUser(name string, sessionID string) (User, error) {
	user := NewUser(name, sessionID)
	result := userRepo.db.Create(&user)
	if result.Error != nil {
		return user, result.Error
	}
	return user, nil
}

func (userRepo UserRepo) FindUserBySessionID(sessionID string) (User, error) {
	var user User
	result := userRepo.db.Preload("UserInLobbies.Lobby").Where("session_id = ?", sessionID).First(&user)
	// result := userRepo.db.Where("session_id = ?", sessionID).First(&user)
	if result.Error != nil {
		return user, result.Error
	}
	return user, nil
}

func (userRepo UserRepo) ResolveUser(c *gin.Context) (User, bool) {
	sessionID, exists := middleware.GetSessionID(c)
	if !exists {
		return User{}, false
	}
	user, err := userRepo.FindUserBySessionID(sessionID)
	if err != nil {
		return user, false
	}
	return user, true
}
