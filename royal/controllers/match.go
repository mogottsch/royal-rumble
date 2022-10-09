package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mogottsch/royal/services"
)

type MatchController struct {
	matchService *services.MatchService
}

func NewMatchController(matchService *services.MatchService) MatchController {
	return MatchController{
		matchService: matchService,
	}
}

func (m MatchController) List(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"matches": m.matchService.GetMatches(),
	})
}
