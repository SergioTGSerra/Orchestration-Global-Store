package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
)

const (
	dbURL       = "postgres://is:is@db-xml:5432/is?sslmode=disable"
	rabbitMQURL = "amqp://is:is@rabbitmq:5672/is"
	queueName   = "tasks"
	interval    = 5 * time.Minute
)

func connectToDatabase() (*sql.DB, error) {
	db, err := sql.Open("postgres", dbURL)
	fmt.Println("Connected to database")
	if err != nil {
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		return nil, err
	}
	return db, nil
}

func connectToRabbitMQ() (*amqp.Connection, error) {
    var conn *amqp.Connection
    var err error

    for i := 1; i <= 5; i++ {
        conn, err = amqp.Dial(rabbitMQURL)
        if err == nil {
			fmt.Println("Connected to RabbitMQ")
            break
        }

        fmt.Printf("Failed to connect to RabbitMQ (attempt %d): %v\n", i, err)
        time.Sleep(3 * time.Second)
    }

    return conn, err
}

func publishToRabbitMQ(ch *amqp.Channel, message string) error {
	err := ch.Publish(
		"",       // exchange
		queueName, // routing key
		false,    // mandatory
		false,    // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message),
		},
	)
	if err != nil {
		return fmt.Errorf("failed to publish message to RabbitMQ: %v", err)
	}
	fmt.Println("Published message to RabbitMQ")
	return nil
}

func checkAndPublishNewEntities(db *sql.DB, ch *amqp.Channel) error {
	var newXMLs []string

	query := "SELECT xml FROM imported_documents WHERE created_on > $1"

	rows, err := db.Query(query, time.Now().Add(-5*time.Minute))
	if err != nil {
		return fmt.Errorf("failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var xmlData string
		if err := rows.Scan(&xmlData); err != nil {
			return fmt.Errorf("failed to scan row: %v", err)
		}
		newXMLs = append(newXMLs, xmlData)
	}

	fmt.Printf("Found %d new XML documents\n", len(newXMLs))

	for _, xmlData := range newXMLs {
		message := "New Entities to be imported! " + xmlData
		err := publishToRabbitMQ(ch, message)
		if err != nil {
			return err
		}
		message = "New geospatial data to be updated!"
		err = publishToRabbitMQ(ch, message)
		if err != nil {
			return err
		}
	}
	return nil
}

func main() {
	db, err := connectToDatabase()
	if err != nil {
		log.Fatalf("Error connecting to the database: %s\n", err)
	}

	conn, err := connectToRabbitMQ()
	if err != nil {
		log.Fatalf("Error connecting to RabbitMQ: %s\n", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Error creating RabbitMQ channel: %s\n", err)
	}
	defer ch.Close()

	_, err = ch.QueueDeclare(
		queueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		log.Fatalf("Error declaring RabbitMQ queue: %s\n", err)
	}

	err = checkAndPublishNewEntities(db, ch)
	if err != nil {
		log.Fatalf("Error checking and publishing new entities: %s\n", err)
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			err := checkAndPublishNewEntities(db, ch)
			if err != nil {
				log.Printf("Error checking and publishing new entities: %s\n", err)
			}
		}
	}
}
