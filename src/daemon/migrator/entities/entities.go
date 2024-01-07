package entities

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