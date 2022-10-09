package services

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Match struct {
	Year int `json:"year"`
}

type MatchService struct {
	matches []Match
}

func NewMatchService() *MatchService {
	s := &MatchService{}
	err := s.Scan()
	if err != nil {
		panic(err)
	}
	fmt.Println("matches")
	fmt.Println(s.matches)
	return s
}

func (s *MatchService) Scan() error {
	files, err := os.ReadDir("./data/matches")
	if err != nil {
		return err
	}

	matches := make([]Match, 0, len(files))

	for _, file := range files {
		name := file.Name()
		if !strings.HasSuffix(name, ".json") {
			continue
		}
		parts := strings.Split(name, ".")

		year, err := strconv.Atoi(parts[0])
		if err != nil {
			return err
		}
		matches = append(matches, Match{Year: year})

	}
	s.matches = matches
	return nil
}

func (s *MatchService) GetMatches() []Match {
	return s.matches
}
