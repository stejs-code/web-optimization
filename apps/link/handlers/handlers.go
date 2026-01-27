package handlers

import (
	"database/sql"
	"errors"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stejs/web-optimization/apps/link/db"
)

type Handler struct {
	db  *sql.DB
	ctx *gin.Context
}

func NewHandler(db *db.Database, ctx *gin.Context) *Handler {
	return &Handler{db: db.DB, ctx: ctx}
}

type CreateLinkReq struct {
	Destination string `json:"url"`
	ShortCode   string `json:"shortCode"`
}

func (h *Handler) Error(code int, err string) {
	h.ctx.JSON(code, gin.H{"error": true, "message": err})
}

var creationsSinceLastCheck = 0

func (h *Handler) CheckOverflow() {
	if creationsSinceLastCheck > 40 || creationsSinceLastCheck <= 0 {
		creationsSinceLastCheck = 0
	} else {
		creationsSinceLastCheck++
	}

	if creationsSinceLastCheck == 0 {
		res := h.db.QueryRow(`SELECT COUNT(*) FROM links`)

		count := 0
		res.Scan(&count)

		if count > 1500 {
			_, err := h.db.Exec(`DELETE FROM links ORDER BY created_at ASC LIMIT ?`, count-1500)

			if err != nil {
				log.Println("error while removing excess records", err)
			}
		}

	}
}

func (h *Handler) CreateLink() {
	token, err := h.Authorize()
	if err != nil {
		return
	}

	var json CreateLinkReq
	if err := h.ctx.ShouldBindJSON(&json); err != nil {
		h.Error(400, err.Error())
		return
	}

	if json.Destination == "" {
		h.Error(400, "url is required")
		return
	}

	if json.ShortCode == "" {
		h.Error(400, "shortCode is required")
		return
	}

	h.CheckOverflow()
	query := h.db.QueryRow(`SELECT short_code FROM links WHERE short_code = ?`, json.ShortCode)
	res := ""
	err = query.Scan(&res)

	if err == nil || res != "" {
		h.Error(400, "shortCode already exists")
		return
	}

	_, err = h.db.Exec(`
		INSERT INTO links (destination, short_code, token, created_at, visits )
		VALUES (?, ?, ?, ?, ?)`,
		json.Destination, json.ShortCode, token, time.Now(), 0,
	)

	if err != nil {
		log.Println(err)
		h.Error(500, "insertion failed")
		return
	}

	h.ctx.JSON(201, gin.H{"error": false})
}

func (h *Handler) findLink(shortCode string) (Link, error) {
	query := h.db.QueryRow(`SELECT destination, visits, token FROM links WHERE short_code = ? `, shortCode)

	record := Link{}
	err := query.Scan(&record.Destination, &record.Visits, &record.Token)
	if err != nil {
		log.Println(err)
		return Link{}, err
	}

	return record, nil
}

func (h *Handler) RedirectLink() {
	shortCode := h.ctx.Param("id")

	if shortCode == "" {
		h.Error(400, "shortCode is required")
		return
	}

	record, err := h.findLink(shortCode)

	go h.db.Exec(`UPDATE links SET visits = visits + 1 WHERE short_code = ?`, shortCode)

	if err != nil {
		log.Println(err)
		//h.Error(404, "link not found")
		h.ctx.File("404.html")

		return
	}

	h.ctx.Redirect(307, record.Destination)
}

func (h *Handler) GetLink() {
	token, err := h.Authorize()
	if err != nil {
		return
	}

	shortCode := h.ctx.Param("id")

	if shortCode == "" {
		h.Error(400, "shortCode is required")
		return
	}

	record, err := h.findLink(shortCode)

	if err != nil {
		log.Println(err)
		h.Error(404, "link not found")
		return
	}

	if record.Token != token {
		h.Error(401, "invalid token")
		return
	}

	h.ctx.JSON(200, gin.H{"error": false, "link": record})

}

func (h *Handler) GetLinks() {
	token, err := h.Authorize()
	if err != nil {
		h.Error(401, "invalid token")
		return
	}
	var links []Link
	rows, err := h.db.Query(`SELECT short_code, destination, visits FROM links WHERE token = ?`, token)
	if err != nil {
		log.Println(err)
		h.Error(500, "failed to fetch links")
		return
	}

	for rows.Next() {
		var link Link
		if err := rows.Scan(&link.ShortCode, &link.Destination, &link.Visits); err != nil {
			log.Println(err)
			h.Error(500, "failed to scan link")
			return
		}
		links = append(links, link)
	}

	if err := rows.Err(); err != nil {
		log.Println(err)
		h.Error(500, "failed to iterate links")
		return
	}

	h.ctx.JSON(200, gin.H{"error": false, "links": links})
}

func (h *Handler) DeleteLink() {
	shortCode := h.ctx.Param("id")
	token, err := h.Authorize()
	if err != nil {
		h.Error(401, "invalid token")
		return
	}

	_, err = h.db.Exec(`DELETE FROM links WHERE short_code = ? AND token = ?`, shortCode, token)

	if err != nil {
		log.Println(err)
		h.Error(500, "failed to delete link")
	}

	h.ctx.JSON(200, gin.H{"error": false})
}

func (h *Handler) Authorize() (string, error) {
	auth := h.ctx.GetHeader("Authorization")

	if auth == "" {
		h.Error(401, "no authorization header")
		return "", errors.New("no authorization header")
	}

	const prefix = "Bearer "
	if !strings.HasPrefix(auth, prefix) {
		return "", errors.New("invalid authorization header")
	}

	token := strings.TrimPrefix(auth, prefix)

	return token, nil
}

func (h *Handler) Exists() {
	shortCode := h.ctx.Param("id")

	if shortCode == "" {
		h.Error(400, "shortCode is required")
		return
	}

	_, err := h.findLink(shortCode)

	if err != nil {
		h.ctx.JSON(200, gin.H{"error": false, "exists": false})
		return
	}

	h.ctx.JSON(200, gin.H{"error": false, "exists": true})
}

type Link struct {
	Destination string `json:"url"`
	ShortCode   string `json:"shortCode"`
	Visits      int    `json:"visits"`
	Token       string `json:"token"`
}
