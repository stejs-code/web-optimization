package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stejs/web-optimization/apps/link/db"
	"github.com/stejs/web-optimization/apps/link/handlers"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./links.db"
	}

	baseURL := os.Getenv("BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:" + port
	}

	database, err := db.NewDatabase(dbPath)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"tagline": "Ladle, uhghghggh",
		})
	})

	router.GET("/:id", func(c *gin.Context) {
		handlers.NewHandler(database, c).RedirectLink()
	})

	router.GET("/_api/links", func(c *gin.Context) {
		handlers.NewHandler(database, c).GetLinks()
	})

	router.POST("/_api/links", func(c *gin.Context) {
		handlers.NewHandler(database, c).CreateLink()
	})

	router.GET("/_api/links/:id", func(c *gin.Context) {
		handlers.NewHandler(database, c).GetLink()
	})

	router.DELETE("/_api/links/:id", func(c *gin.Context) {
		handlers.NewHandler(database, c).DeleteLink()
	})

	router.GET("/_api/links/:id/exists", func(c *gin.Context) {
		handlers.NewHandler(database, c).Exists()
	})

	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}

	log.Printf("Server starting on port %s", port)
	log.Printf("Database path: %s", dbPath)
	log.Printf("Base URL: %s", baseURL)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
