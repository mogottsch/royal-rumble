package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Schema struct {
	models []interface{}
}

func NewSchema(models []interface{}) *Schema {
	return &Schema{models: models}
}

func connect() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	return db
}

func (s *Schema) Migrate(db *gorm.DB) error {
	err := db.AutoMigrate(s.models...)
	if err != nil {
		return err
	}
	return nil
}

func Setup(schema *Schema) (*gorm.DB, error) {
	db := connect()
	err := schema.Migrate(db)
	if err != nil {
		return nil, err
	}
	return db, nil
}
