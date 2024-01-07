package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"
	"encoding/xml"
	"strings"
	"bytes"
	"net/http"
	"encoding/json"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"github.com/streadway/amqp"
	"app/entities"
)

const (
	dbURL       = "postgres://is:is@db-rel:5432/is?sslmode=disable"
	rabbitMQURL = "amqp://is:is@rabbitmq:5672/is"
	entityQueueName   = "Entities_Tasks"
	geospatialQueueName = "Geospatial_Tasks"
	interval    = 5 * time.Minute
	maxAttempts = 20
	apiUrl = "http://api-entities:8080/"
)

func connectToApi() (error) {
	apiURL := apiUrl + "ping"
    
	for attempt := 1; attempt <= maxAttempts; attempt++ {
        resp, err := http.Get(apiURL)
        if err == nil && resp.StatusCode == http.StatusOK {
            fmt.Println("Connected to api successfully")
            return nil
        }
        time.Sleep(20 * time.Second)
    }

	return fmt.Errorf("Failed to connect to API after %d attempts", maxAttempts)
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

func receiveFromRabbitMQ(ch *amqp.Channel, queueName string) error {
    msgs, err := ch.Consume(
        queueName, // queue
        "",        // consumer
        true,      // auto-ack
        false,     // exclusive
        false,     // no-local
        false,     // no-wait
        nil,       // args
    )

    if err != nil {
        return fmt.Errorf("failed to register a consumer: %v", err)
    }

    forever := make(chan bool)

    go func() {
        for msg := range msgs {
            xmlString := string(msg.Body)

            reader := strings.NewReader(xmlString)

            var store entities.Store
            decoder := xml.NewDecoder(reader)
            err := decoder.Decode(&store)
            if err != nil {
                fmt.Println("Erro ao decodificar o XML:", err)
                return
            }

			var markets []map[string]interface{}
			for _, market := range store.Markets {
				uuid := stringToUUID(market.Name + market.Region)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name":   market.Name,
					"region": market.Region,
				}
				markets = append(markets, data)
			}
			sendToApi("markets", markets)

			var ship_modes []map[string]interface{}
			for _, shipping := range store.Orders {
				uuid := stringToUUID(shipping.Shipping.Mode)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name": shipping.Shipping.Mode,
				}
				ship_modes = append(ship_modes, data)
			}
			sendToApi("ship-modes", ship_modes)

			var priorities []map[string]interface{}
			for _, priority := range store.Orders {
				uuid := stringToUUID(priority.Priority)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name": priority.Priority,
				}
				priorities = append(priorities, data)
			}
			sendToApi("priorities", priorities)

			var segments []map[string]interface{}
			for _, segment := range store.Segments {
				uuid := stringToUUID(segment.Name)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name": segment.Name,
				}
				segments = append(segments, data)
			}
			sendToApi("segments", segments)

			var categories []map[string]interface{}
			for _, category := range store.Categories {
				uuid:= stringToUUID(category.Name)
				var data map[string]interface{}
				if category.ParentCategoryID != "" {
					category.ParentCategoryID = stringToUUID(getCategoryID(category.ParentCategoryID, store)).String()
					data = map[string]interface{}{
						"uuid":            uuid.String(),
						"name":            category.Name,
						"father_category": category.ParentCategoryID,
					}
				} else {
					data = map[string]interface{}{
						"uuid": uuid.String(),
						"name": category.Name,
					}
				}
				categories = append(categories, data)
			}
			sendToApi("categories", categories)
			
			var countries []map[string]interface{}
			for _, country := range store.Countries {
				uuid := stringToUUID(country.Name).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": country.Name,
				}
				countries = append(countries, data)
			}
			sendToApi("countries", countries)

			var states []map[string]interface{}
			for _, state := range store.States {
				uuid := stringToUUID(state.Name).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": state.Name,
				}
				states = append(states, data)
			}
			sendToApi("states", states)

			var customers []map[string]interface{}
			for _, customer := range store.Customers {
				uuid := stringToUUID(customer.ID).String()
				customer.SegmentRef = stringToUUID(getSegmentID(customer.SegmentRef, store)).String()
				customer.Address.CountryRef = stringToUUID(getCountryID(customer.Address.CountryRef, store)).String()
				customer.Address.StateRef = stringToUUID(getStateID(customer.Address.StateRef, store)).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": customer.Name,
					"segment": customer.SegmentRef,
					"postal_code": customer.Address.PostalCode,
					"city": customer.Address.City,
					"state": customer.Address.StateRef,
					"country": customer.Address.CountryRef,
				}
				customers = append(customers, data)
			}
			sendToApi("customers", customers)

			var products []map[string]interface{}
			for _, product := range store.Products {
				uuid := stringToUUID(product.ID).String()
				product.CategoryRef = stringToUUID(getCategoryID(product.CategoryRef, store)).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": product.Name,
					"category": product.CategoryRef,
				}
				products = append(products, data)
			}
			sendToApi("products", products)

			var orders  []map[string]interface{}
			for _, order := range store.Orders {
				uuid := stringToUUID(order.ID).String()
				order.CustomerRef = stringToUUID(order.CustomerRef).String()
				order.MarketRef = stringToUUID(getMarketID(order.MarketRef, store)).String()
				order.Shipping.Mode = stringToUUID(order.Shipping.Mode).String()
				order.Priority = stringToUUID(order.Priority).String()
				orderDate, _ := time.Parse("02-01-2006", order.Date)
				shippingDate, _ := time.Parse("02-01-2006", order.Shipping.Date)
				data := map[string]interface{}{
					"uuid": uuid,
					"order_date": orderDate,
					"priority": order.Priority,
					"customer": order.CustomerRef,
					"market": order.MarketRef,
					"ship_mode": order.Shipping.Mode,
					"shipping_cost": order.Shipping.Cost,
					"ship_date": shippingDate,
				}
				orders = append(orders, data)
			}
			sendToApi("orders", orders)

			var ordersProducts []map[string]interface{}
			for _, order_products := range store.Orders {
				order_products.ID = stringToUUID(order_products.ID).String()
				for _, order_product := range order_products.OrderProducts {
					order_product.ProductRef = stringToUUID(order_product.ProductRef).String()
					data := map[string]interface{}{
						"order_uuid": order_products.ID,
						"product_uuid": order_product.ProductRef,
						"quantity": order_product.Quantity,
						"sales": order_product.Sales,
						"discount": order_product.Discount,
						"profit": order_product.Profit,
					}
					ordersProducts = append(ordersProducts, data)
				}
			}
			sendToApi("order-products", ordersProducts)
        }
    }()
    <-forever
    return nil
}

func stringToUUID(input string) (uuid.UUID) {
	namespace := uuid.Nil
	hash := uuid.NewMD5(namespace, []byte(input))
	return hash
}

func getCategoryID(id string, store entities.Store) (string) {
	for _, category := range store.Categories {             
		if category.ID == id {
			return category.Name
		}
	}
	return ""
}

func getSegmentID(id string, store entities.Store) (string) {
	for _, segment := range store.Segments {
		if segment.ID == id {
			return segment.Name
		}
	}
	return ""
}

func getCountryID(id string, store entities.Store) (string) {
	for _, country := range store.Countries {
		if country.ID == id {
			return country.Name
		}
	}
	return ""
}

func getStateID(id string, store entities.Store) (string) {
	for _, state := range store.States {
		if state.ID == id {
			return state.Name
		}
	}
	return ""
}

func getMarketID(id string, store entities.Store) (string) {
	for _, market := range store.Markets {
		if market.ID == id {
			return market.Name + market.Region
		}
	}
	return ""
}

func sendToApi(endpoint string, data []map[string]interface{}) error {
	apiURL := apiUrl + endpoint

	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return err
	}

	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return err
	}
	defer resp.Body.Close()

	fmt.Println(endpoint + " created successfully")

	return nil
}

func main() {
	err := connectToApi()
	if err != nil {
		log.Fatalf("Error connecting to API: %s", err)
	}

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

	ch, err = conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	err = receiveFromRabbitMQ(ch, entityQueueName)
	if err != nil {
		log.Fatalf("Failed to receive from RabbitMQ: %v", err)
	}
}