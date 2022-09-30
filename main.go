package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/mogottsch/royal/controllers"
	"github.com/mogottsch/royal/db"
	"github.com/mogottsch/royal/middleware"
	"github.com/mogottsch/royal/models"
	"gorm.io/gorm"
)

func main() {
	fmt.Println("starting server")

	r, db := setup()
	r.GET("/ping", func(c *gin.Context) {
		sessionId, _ := middleware.GetSessionID(c)
		c.JSON(http.StatusOK, gin.H{
			"session": sessionId,
		})
	})

	userController := controllers.NewUserController(models.NewUserRepo(db))
	lobbyController := controllers.NewLobbyController(models.NewLobbyRepo(db), models.NewUserRepo(db))

	r.GET("/user", userController.Retrieve)
	r.POST("/lobby", lobbyController.Create)
	r.POST("/lobby/:lobby_code", lobbyController.Join)

	err := r.Run()

	if err != nil {
		panic(err)
	}

	fmt.Println("Running on port 8080")
}

func setupDB(r *gin.Engine) *gorm.DB {
	schema := models.GetSchema()
	db, err := db.Setup(schema)
	if err != nil {
		panic("failed to connect database")
	}

	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})
	return db
}

func setupSession(r *gin.Engine) {
	store := cookie.NewStore([]byte(os.Getenv("APP_KEY") + "_session"))
	r.Use(sessions.Sessions("session", store))
	r.Use(middleware.Authentication())
}

func setup() (*gin.Engine, *gorm.DB) {
	godotenv.Load()

	r := gin.Default()

	db := setupDB(r)

	setupSession(r)

	return r, db
}
