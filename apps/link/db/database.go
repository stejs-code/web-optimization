package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	DB *sql.DB
}

func NewDatabase(dbPath string) (*Database, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	database := &Database{DB: db}
	if err := database.createTables(); err != nil {
		return nil, err
	}

	log.Println("Database connected successfully")
	return database, nil
}

func (d *Database) createTables() error {
	query := `
	CREATE TABLE IF NOT EXISTS links (
		short_code TEXT PRIMARY KEY,
		destination TEXT NOT NULL,
		token TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		visits INTEGER DEFAULT 0
	);
	CREATE INDEX IF NOT EXISTS idx_token ON links(token);
	`

	_, err := d.DB.Exec(query)
	if err != nil {
		return err
	}

	log.Println("Tables created successfully")
	return nil
}

func (d *Database) Close() error {
	return d.DB.Close()
}
