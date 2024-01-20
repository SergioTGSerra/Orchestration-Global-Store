import sys
from flask import Flask
import magql
from flask_magql import MagqlExtension
from db_connection import DBConnection

OrderType = magql.Object("Order", fields={
    "order_id": "ID",
    "order_date": "String",
    "shipped_date": "String",
    "ship_mode": "String",
    "customer_name": "String",
    "shipping_cost": "Float",
})

OrderDetailsType = magql.Object("OrderDetails", fields={
    "order_id": "ID",
    "order_date": "String",
    "shipped_date": "String",
    "ship_mode": "String",
    "customer_name": "String",
    "postal_code": "String",
    "state_name": "String",
    "state_geometry": "String",
})

CustomerType = magql.Object("Customer", fields={
    "customer_id": "ID",
    "customer_name": "String",
    "postal_code": "String",
    "city": "String",
    "country_name": "String",
    "state_name": "String",
    "state_geometry": "String",
})

SegmentCountType = magql.Object("SegmentCount", fields={
    "segment_name": "String",
    "customer_count": "Int",
})

MarketType = magql.Object("Market", fields={
    "market_id": "ID",
    "market_name": "String",
})

schema = magql.Schema(types=[OrderType, CustomerType, SegmentCountType, OrderDetailsType, MarketType])

class Order:
    def __init__(self, order_id, order_date, shipped_date, ship_mode, customer_name, shipping_cost):
        self.order_id = order_id
        self.order_date = order_date
        self.shipped_date = shipped_date
        self.ship_mode = ship_mode
        self.customer_name = customer_name
        self.shipping_cost = shipping_cost

class Customer:
    def __init__(self, customer_id, customer_name, postal_code, city, country_name, state_name, state_geometry):
        self.customer_id = customer_id
        self.customer_name = customer_name
        self.postal_code = postal_code
        self.city = city
        self.country_name = country_name
        self.state_name = state_name
        self.state_geometry = state_geometry

class SegmentCount:
    def __init__(self, segment_name, customer_count):
        self.segment_name = segment_name
        self.customer_count = customer_count

class OrderDetails:
    def __init__(self, order_id, order_date, shipped_date, ship_mode, customer_name, postal_code, state_name, state_geometry):
        self.order_id = order_id
        self.order_date = order_date
        self.shipped_date = shipped_date
        self.ship_mode = ship_mode
        self.customer_name = customer_name
        self.postal_code = postal_code
        self.state_name = state_name
        self.state_geometry = state_geometry

class Market:
    def __init__(self, market_id, market_name):
        self.market_id = market_id
        self.market_name = market_name

@schema.query.field("get_orders", "[Order]")
def resolve_get_orders(parent, info):
    query = """
    SELECT
        o.uuid AS order_id,
        o.order_date,
        o.ship_date AS shipped_date,
        sm.name AS ship_mode,
        c.name AS customer_name,
        o.shipping_cost
    FROM
        orders o
    JOIN ship_modes sm ON o.ship_mode = sm.uuid
    JOIN customers c ON o.customer = c.uuid
    JOIN priorities p ON o.priority = p.uuid
    ORDER BY
        p.name;
    """
    db_connection = DBConnection()
    results = db_connection.execute_query_with_return(query)
    orders = [Order(*result) for result in results]
    return orders

@schema.query.field("get_orders_by_market", "[Order]", args={"market": magql.Argument("String!", default="null")})
def resolve_get_orders_by_market(parent, info, **kwargs):
    market = kwargs.get("market", "null")
    query = """
    SELECT
        o.uuid AS order_id,
        o.order_date,
        o.ship_date AS shipped_date,
        sm.name AS ship_mode,
        c.name AS customer_name,
        o.shipping_cost AS ship_cost
    FROM
        orders o
    JOIN ship_modes sm ON o.ship_mode = sm.uuid
    JOIN customers c ON o.customer = c.uuid
    WHERE
        o.market = '{}'
    ORDER BY
        o.shipping_cost DESC;
    """.format(market)
    db_connection = DBConnection()
    results = db_connection.execute_query_with_return(query)
    orders = [Order(*result) for result in results]
    return orders

@schema.query.field("get_customers", "[Customer]")
def resolve_get_customers(parent, info):
    query = """
    SELECT
        c.uuid AS customer_id,
        c.name AS customer_name,
        c.postal_code,
        c.city,
        co.name AS country_name,
        s.name AS state_name,
        s.geom AS state_geometry
    FROM
        customers c
    JOIN countries co ON c.country = co.uuid
    JOIN states s ON c.state = s.uuid
    ORDER BY
        c.name;
    """
    db_connection = DBConnection()
    results = db_connection.execute_query_with_return(query)
    customers = [Customer(*result) for result in results]
    return customers

@schema.query.field("get_segment_counts", "[SegmentCount]")
def resolve_get_segment_counts(parent, info):
    query = """
    SELECT
        seg.name AS segment_name,
        COUNT(*) AS customer_count
    FROM
        customers c
    JOIN segments seg ON c.segment = seg.uuid
    GROUP BY
        seg.name;
    """
    db_connection = DBConnection()
    results = db_connection.execute_query_with_return(query)
    segment_counts = [SegmentCount(*result) for result in results]
    return segment_counts

@schema.query.field("get_order_details", "[OrderDetails]")
def resolve_get_order_details(parent, info):
    query = """
    SELECT
        o.uuid AS order_id,
        o.order_date,
        o.ship_date AS shipped_date,
        sm.name AS ship_mode,
        c.name AS customer_name,
        c.postal_code,
        s.name AS state_name,
        s.geom AS state_geometry
    FROM
        orders o
    JOIN ship_modes sm ON o.ship_mode = sm.uuid
    JOIN customers c ON o.customer = c.uuid
    JOIN states s ON c.state = s.uuid
    GROUP BY
        o.uuid, o.order_date, o.ship_date, sm.name, c.name, c.postal_code, s.name, s.geom;
    """
    db_connection = DBConnection()
    results = db_connection.execute_query_with_return(query)
    order_details = [OrderDetails(*result) for result in results]
    return order_details

@schema.query.field("get_markets", "[Market]")
def resolve_get_markets(parent, info):
    query = """
    SELECT
        uuid AS market_id,
        name AS market_name
    FROM
        markets
    ORDER BY
        name;
    """
    db_connection = DBConnection()
    results = db_connection.execute_query_with_return(query)
    markets = [Market(*result) for result in results]
    return markets

magql_ext = MagqlExtension(schema)

app = Flask(__name__)
app.config["DEBUG"] = True
magql_ext.init_app(app)
app.run(host="0.0.0.0", port=sys.argv[1])
