package middleware

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const SessionIDKey = "sessionID"

func Authentication() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		sessionID := session.Get("id")
		if sessionID == nil {
			sessionID = GenerateNewSessionID()
			session.Set("id", sessionID)
			session.Save()
		}
		c.Set(SessionIDKey, sessionID)
		c.Next()
	}
}

func GenerateNewSessionID() string {
	return uuid.New().String()
}

func GetSessionID(c *gin.Context) (string, bool) {
	sessionID, exists := c.Get(SessionIDKey)
	if !exists {
		return "", false
	}
	return sessionID.(string), true

}
