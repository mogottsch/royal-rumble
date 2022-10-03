package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mogottsch/royal/middleware"
	"github.com/mogottsch/royal/models"
)

type LobbyController struct {
	lobbyRepo models.LobbyRepo
	userRepo  models.UserRepo
}

func NewLobbyController(lobbyRepo models.LobbyRepo, userRepo models.UserRepo) LobbyController {
	return LobbyController{
		lobbyRepo: lobbyRepo,
		userRepo:  userRepo,
	}
}

type LobbyCreateRequest struct {
	UserName string `json:"user_name"`
}

func (l LobbyController) Create(c *gin.Context) {
	user, exists := l.userRepo.ResolveUser(c)
	if !exists {
		newUser, success := l.CreateUserFromRequest(c)
		if !success {
			return
		}
		user = newUser
	}
	lobby, err := l.lobbyRepo.CreateLobby()
	if err != nil {
		panic(err)
	}
	err = l.userRepo.AddUserToLobby(user, lobby)
	if err != nil {
		panic(err)
	}

	c.JSON(http.StatusOK, gin.H{
		"lobby": lobby,
		"user":  user,
	})
}

func (l LobbyController) Join(c *gin.Context) {
	lobbyCode := c.Param("lobby_code")
	if lobbyCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "lobby_id is required",
		})
		return
	}

	lobby, err := l.lobbyRepo.FindLobbyByCode(lobbyCode)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "lobby not found",
		})
		return
	}

	user, exists := l.userRepo.ResolveUser(c)
	if !exists {
		newUser, success := l.CreateUserFromRequest(c)
		if !success {
			return
		}
		user = newUser
	}

	err = l.userRepo.AddUserToLobby(user, lobby)

	c.JSON(http.StatusOK, gin.H{
		"lobby": lobby,
		"user":  user,
	})
}

func (l LobbyController) CreateUserFromRequest(c *gin.Context) (*models.User, bool) {
	var request LobbyCreateRequest
	err := c.ShouldBindJSON(&request)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request",
		})
		return nil, false
	}

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "no user found in session and no new user name provided",
		})
		return nil, false
	}
	sessionID, exists := middleware.GetSessionID(c)
	if !exists {
		panic("no session id found")
	}
	userName := request.UserName

	if userName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "no user name provided",
		})
		return nil, false
	}

	user, err := l.userRepo.CreateUser(userName, sessionID)
	if err != nil {
		panic(err)
	}
	return user, true
}
