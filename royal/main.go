package main

import (
	crypto_rand "crypto/rand"
	"encoding/binary"
	"fmt"
	math_rand "math/rand"
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
	"github.com/tkrajina/typescriptify-golang-structs/typescriptify"
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
	r.POST("/lobbies", lobbyController.Create)
	r.POST("/lobbies/:lobby_code", lobbyController.Join)
	r.GET("/lobbies/:lobby_code", lobbyController.Join)
	r.GET("/ws", func(c *gin.Context) {
		controllers.WSHandler(c.Writer, c.Request)
	})

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

	generateTSFiles(schema)

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

	initSeed()

	return r, db
}

func initSeed() {
	var b [8]byte
	_, err := crypto_rand.Read(b[:])
	if err != nil {
		panic("cannot seed math/rand package with cryptographically secure random number generator")
	}
	math_rand.Seed(int64(binary.LittleEndian.Uint64(b[:])))
}

func generateTSFiles(schema *db.Schema) {
	if os.Getenv("GENERATE_TS_FILES") != "true" {
		fmt.Println("skipping ts file generation")
		return
	}

	converter := typescriptify.New().WithBackupDir("./ts/backup")
	// currently broken
	// for _, model := range schema.Models {
	// 	converter.Add(model)
	// }
	converter.Add(models.User{})
	converter.Add(models.Action{})
	converter.Add(models.Match{})

	err := converter.ConvertToFile("../rumble/src/models.ts")
	if err != nil {
		panic(err.Error())
	}
}
