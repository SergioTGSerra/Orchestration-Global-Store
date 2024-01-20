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

schema = magql.Schema(types=[OrderType])

@schema.query.field(
    "greet", "String!", args={"name": magql.Argument("String!", default="World")}
)
def resolve_greet(parent, info, **kwargs):
    name = kwargs.pop("name")
    return f"Hello, {name}!"

class Order:
    def __init__(self, order_id, order_date, shipped_date, ship_mode, customer_name, shipping_cost):
        self.order_id = order_id
        self.order_date = order_date
        self.shipped_date = shipped_date
        self.ship_mode = ship_mode
        self.customer_name = customer_name
        self.shipping_cost = shipping_cost
        
@schema.query.field("get_orders", "[Order]")  # Define a new GraphQL query field
def resolve_get_orders(parent, info):
    # Fetch data from the database using the provided query
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

    # Get a DB connection instance
    db_connection = DBConnection()

    # Execute the query and fetch results
    results = db_connection.execute_query_with_return(query)

    # Transform the database results into a list of Order objects
    orders = [Order(*result) for result in results]

    # Return the list of orders to GraphQL
    return orders

magql_ext = MagqlExtension(schema)

app = Flask(__name__)
app.config["DEBUG"] = True
magql_ext.init_app(app)
app.run(host="0.0.0.0", port=sys.argv[1])