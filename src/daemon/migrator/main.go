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
)

const (
	dbURL       = "postgres://is:is@db-rel:5432/is?sslmode=disable"
	rabbitMQURL = "amqp://is:is@rabbitmq:5672/is"
	queueName   = "Entities_Tasks"
	interval    = 5 * time.Minute
)

type Store struct {
	Orders    []Order    `xml:"Orders>Order"`
	Products  []Product  `xml:"Products>Product"`
	Markets   []Market   `xml:"Markets>Market"`
	Customers []Customer `xml:"Customers>Customer"`
	Segments  []Segment  `xml:"Segments>Segment"`
	States    []State    `xml:"States>State"`
	Countries []Country  `xml:"Countries>Country"`
	Categories []Category `xml:"Categories>Category"`
}

type Order struct {
	ID         string    `xml:"id,attr"`
	Date       string    `xml:"date,attr"`
	Priority    string    `xml:"priority,attr"`
	CustomerRef string  `xml:"customer_ref,attr"`
	MarketRef  string    `xml:"market_ref,attr"`
	Shipping   Shipping  `xml:"Shipping"`
	OrderProducts   []OrderProduct `xml:"Products>Product"`
}

type OrderProduct struct {
	Quantity int     `xml:"quantity,attr"`
    Sales    float64 `xml:"sales,attr"`
    Discount float64 `xml:"discount,attr"`
    Profit   float64 `xml:"profit,attr"`
	ProductRef string `xml:"id,attr"`
}
	

type Shipping struct {
	Date string `xml:"date,attr"`
	Mode string `xml:"mode,attr"`
	Cost float64 `xml:"cost,attr"`
}

type Product struct {
	ID           string `xml:"id,attr"`
	Name         string `xml:"name,attr"`
	CategoryRef  string `xml:"category_ref,attr"`
}

type Market struct {
	ID     string `xml:"id,attr"`
	Name   string `xml:"name,attr"`
	Region string `xml:"region,attr"`
}

type Customer struct {
	ID         string  `xml:"id,attr"`
	Name       string  `xml:"name,attr"`
	SegmentRef string `xml:"segment_ref,attr"`
	Address    Address `xml:"Address"`
}

type Address struct {
	CountryRef string `xml:"country_ref,attr"`
	StateRef   string `xml:"state_ref,attr"`
	City       string `xml:"city,attr"`
	PostalCode string `xml:"postal_code,attr"`
}

type Segment struct {
	ID   string `xml:"id,attr"`
	Name string `xml:"name,attr"`
}

type State struct {
	ID   string `xml:"id,attr"`
	Name string `xml:"name,attr"`
	Lat  string `xml:"lat,attr"`
	Lon  string `xml:"lon,attr"`
}

type Country struct {
	ID   string `xml:"id,attr"`
	Name string `xml:"name,attr"`
}

type Category struct {
	ID                string `xml:"id,attr"`
	Name              string `xml:"name,attr"`
	ParentCategoryID string `xml:"parent_category_id,attr"`
}


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

    for i := 1; i <= 10; i++ {
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

func receiveFromRabbitMQ(ch *amqp.Channel) error {
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
        for d := range msgs {
            // Converte []byte para string
            xmlString := string(d.Body)

			fmt.Println("New message received!")

            // Cria um leitor de string
            reader := strings.NewReader(xmlString)

            var store Store
            decoder := xml.NewDecoder(reader)
            err := decoder.Decode(&store)
            if err != nil {
                fmt.Println("Erro ao decodificar o XML:", err)
                return
            }

			for _, market := range store.Markets {
				uuid := stringToUUID(market.Name + market.Region)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name":   market.Name,
					"region": market.Region,
				}
				sendToApi("markets", data)
			}

			for _, shipping := range store.Orders {
				uuid := stringToUUID(shipping.Shipping.Mode)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name": shipping.Shipping.Mode,
				}
				sendToApi("ship-modes", data)
			}

			for _, priority := range store.Orders {
				uuid := stringToUUID(priority.Priority)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name": priority.Priority,
				}
				sendToApi("priorities", data)
			}

			for _, segment := range store.Segments {
				uuid := stringToUUID(segment.Name)
				data := map[string]interface{}{
					"uuid": uuid.String(),
					"name": segment.Name,
				}
				sendToApi("segments", data)
			}

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
			
				sendToApi("categories", data)
			}
			

			for _, country := range store.Countries {
				uuid := stringToUUID(country.Name).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": country.Name,
				}
				sendToApi("countries", data)
			}

			for _, state := range store.States {
				uuid := stringToUUID(state.Name).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": state.Name,
				}
				sendToApi("states", data)
			}

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
				sendToApi("customers", data)
			}

			for _, product := range store.Products {
				uuid := stringToUUID(product.ID).String()
				product.CategoryRef = stringToUUID(getCategoryID(product.CategoryRef, store)).String()
				data := map[string]interface{}{
					"uuid": uuid,
					"name": product.Name,
					"category": product.CategoryRef,
				}
				sendToApi("products", data)
			}

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
				sendToApi("orders", data)
			}

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
					sendToApi("order-products", data)
				}
			}
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

func getCategoryID(id string, store Store) (string) {
	for _, category := range store.Categories {             
		if category.ID == id {
			return category.Name
		}
	}
	return ""
}

func getSegmentID(id string, store Store) (string) {
	for _, segment := range store.Segments {
		if segment.ID == id {
			return segment.Name
		}
	}
	return ""
}

func getCountryID(id string, store Store) (string) {
	for _, country := range store.Countries {
		if country.ID == id {
			return country.Name
		}
	}
	return ""
}

func getStateID(id string, store Store) (string) {
	for _, state := range store.States {
		if state.ID == id {
			return state.Name
		}
	}
	return ""
}

func getMarketID(id string, store Store) (string) {
	for _, market := range store.Markets {
		if market.ID == id {
			return market.Name + market.Region
		}
	}
	return ""
}

func sendToApi(endpoint string, data interface{}) error {

	apiURL := "http://api-entities:8080/" + endpoint
	// Convert data to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return err
	}

	// Make a POST request
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return err
	}
	defer resp.Body.Close()

	// Check the response status
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Unexpected response on " + endpoint + " status:", resp.Status)
		return fmt.Errorf("unexpected response status: %s", resp.Status)
	}

	// Read the response body
	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		fmt.Println("Error decoding JSON response:", err)
		return err
	}

	// Print the result
	fmt.Println("API Response:", result)
	return nil
}

func main() {
	conn, err := connectToRabbitMQ()
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	err = receiveFromRabbitMQ(ch)
	if err != nil {
		log.Fatalf("Failed to recive from RabbitMQ: %v", err)
	}

}
