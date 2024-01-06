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
	dbURL             = "postgres://is:is@db-xml:5432/is?sslmode=disable"
	rabbitMQURL       = "amqp://is:is@rabbitmq:5672/is"
	entityQueueName    = "Entities_Tasks"
	geospatialQueueName = "Geospatial_Tasks"
	interval           = 20 * time.Second
	maxAttempts        = 20
)

// Message struct to simplify publishing logic
type Message struct {
	ID   string
	Data string
}

func connectToDatabase() (*sql.DB, error) {
	var db *sql.DB
	var err error

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		db, err = sql.Open("postgres", dbURL)
		if err == nil {
			fmt.Println("Connected to database successfully")
			return db, nil
		}
		time.Sleep(2 * time.Second)
	}

	return nil, fmt.Errorf("Failed to connect to database after %d attempts", maxAttempts)
}

func connectToRabbitMQ() (*amqp.Connection, *amqp.Channel, error) {
	var conn *amqp.Connection
	var err error

	for i := 1; i <= maxAttempts; i++ {
		conn, err = amqp.Dial(rabbitMQURL)
		if err == nil {
			fmt.Println("Connected to RabbitMQ")
			ch, err := conn.Channel()
			if err != nil {
				return nil, nil, fmt.Errorf("Error creating RabbitMQ channel: %s", err)
			}
			return conn, ch, nil
		}
		time.Sleep(3 * time.Second)
	}

	return nil, nil, fmt.Errorf("Failed to connect to RabbitMQ after %d attempts", maxAttempts)
}

func declareQueue(ch *amqp.Channel, queueName string) error {
	_, err := ch.QueueDeclare(
		queueName, // name
		false,     // durable
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	if err != nil {
		return fmt.Errorf("Error declaring RabbitMQ queue %s: %s", queueName, err)
	}
	return nil
}

func publishToRabbitMQ(ch *amqp.Channel, message Message, queueName string) error {
	err := ch.Publish(
		"",        // exchange
		queueName, // routing key
		false,     // mandatory
		false,     // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(message.Data),
		},
	)
	if err != nil {
		return fmt.Errorf("Failed to publish message to RabbitMQ: %v", err)
	}
	return nil
}

func checkAndPublishNewEntities(db *sql.DB, ch *amqp.Channel) error {
	query := "SELECT id, xml FROM imported_documents WHERE watched = false"

	rows, err := db.Query(query)
	if err != nil {
		return fmt.Errorf("Failed to execute query: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var message Message
		err = rows.Scan(&message.ID, &message.Data)
		if err != nil {
			return fmt.Errorf("Failed to scan row: %v", err)
		}

		publishToRabbitMQ(ch, message, entityQueueName)
		publishToRabbitMQ(ch, Message{Data: "New geospatial data to be updated!"}, geospatialQueueName)

		fmt.Printf("Published new XML document with id: %s\n", message.ID)

		updateQuery := "UPDATE imported_documents SET watched = true WHERE id = $1"
		db.Exec(updateQuery, message.ID)
	}

	return nil
}

func main() {
	db, err := connectToDatabase()
	if err != nil {
		log.Fatalf("Error connecting to database: %s", err)
	}
	defer db.Close()

	conn, ch, err := connectToRabbitMQ()
	if err != nil {
		log.Fatalf("Error connecting to RabbitMQ: %s", err)
	}
	defer conn.Close()
	defer ch.Close()

	err = declareQueue(ch, entityQueueName)
	if err != nil {
		log.Fatalf("Error declaring RabbitMQ queue: %s", err)
	}

	err = declareQueue(ch, geospatialQueueName)
	if err != nil {
		log.Fatalf("Error declaring RabbitMQ queue: %s", err)
	}

	err = checkAndPublishNewEntities(db, ch)
	if err != nil {
		log.Fatalf("Error checking and publishing new entities: %s", err)
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		err := checkAndPublishNewEntities(db, ch)
		if err != nil {
			log.Printf("Error checking and publishing new entities: %s", err)
		}
	}
}