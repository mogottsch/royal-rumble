package models

import (
	"bytes"
	"encoding/json"
	"time"

	"github.com/mogottsch/royal/db"
	"gorm.io/gorm"
)

type Model struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

func GetSchema() *db.Schema {
	return db.NewSchema([]interface{}{
		&User{},
		&Lobby{},
		&UserInLobby{},
		&Wrestler{},
		&Action{},
		&Match{},
	})
}

func Stringify(v interface{}) string {
	asJson, _ := json.Marshal(v)
	var out bytes.Buffer
	json.Indent(&out, asJson, "=", "\t")
	return string(out.Bytes())
}
