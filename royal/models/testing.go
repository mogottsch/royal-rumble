package models

import (
	"github.com/go-testfixtures/testfixtures/v3"
	"github.com/mogottsch/royal/db"
	"gorm.io/gorm"
)

func SetupTesting() (*gorm.DB, *testfixtures.Loader, error) {

	var dbG *gorm.DB
	var fixtures *testfixtures.Loader

	schema := GetSchema()
	var err error
	dbG, err = db.Setup(schema)
	if err != nil {
		panic("failed to connect database")
	}

	dbInstance, err := dbG.DB()
	if err != nil {
		panic(err)
	}

	fixtures, err = testfixtures.New(
		testfixtures.Database(dbInstance),
		testfixtures.Dialect("sqlite"),
		testfixtures.Directory("../fixtures"),
	)
	if err != nil {
		panic(err)
	}

	err = fixtures.Load()
	if err != nil {
		panic(err)
	}

	return dbG, fixtures, err
}
