package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mogottsch/royal/models"
)

type UserController struct {
	userRepo models.UserRepo
}

func NewUserController(userRepo models.UserRepo) UserController {
	return UserController{
		userRepo: userRepo,
	}
}

func (u UserController) Retrieve(c *gin.Context) {
	user, exists := u.userRepo.ResolveUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}
