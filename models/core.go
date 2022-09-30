package models

import (
	"bytes"
	"encoding/json"

	"github.com/mogottsch/royal/db"
)

func GetSchema() *db.Schema {
	return db.NewSchema([]interface{}{
		&User{},
		&Lobby{},
		&UserInLobby{},
	})
}

func Stringify(v interface{}) string {
	asJson, _ := json.Marshal(v)
	var out bytes.Buffer
	json.Indent(&out, asJson, "=", "\t")
	return string(out.Bytes())
}
