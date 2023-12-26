import xml.dom.minidom as md
import xml.etree.ElementTree as ET
import urllib.parse
import urllib.request
import json

from utils.reader import CSVReader
from entities.order import Order
from entities.shipping import Shipping
from entities.customer import Customer
from entities.address import Address
from entities.segment import Segment
from entities.state import State
from entities.country import Country
from entities.market import Market
from entities.product import Product
from entities.category import Category
from entities.order_product import OrderProduct

class CSVtoXMLConverter:

    def __init__(self, path):
        self._reader = CSVReader(path)
        self._total_lines = self.count_lines()

    def count_lines(self):
        # Count the number of lines in the CSV file
        with open(self._reader._path, 'r', encoding='utf-8') as file:
            line_count = sum(1 for line in file)
            print(f"Total lines: {line_count}")
        return line_count

    def to_xml(self, current_part, total_parts):
        # Calculate the number of lines per part
        total_lines = self._total_lines
        print(f"Total lines: {total_lines}")
        lines_per_part = total_lines // total_parts
        print(f"Lines per part: {lines_per_part}")

        # Calculate the starting and ending indices for the current part
        start_index = current_part * lines_per_part
        print(f"Start index: {start_index}")
        end_index = (current_part + 1) * lines_per_part if current_part < total_parts - 1 else self._total_lines
        print(f"End index: {end_index}")

        # Read a subset of the CSV based on the calculated indices
        subset_reader = CSVReader(self._reader._path, start=start_index, end=end_index)     
        # read countries
        countries = subset_reader.read_entities(
            attr="Country",
            builder=lambda row: Country(row["Country"])
        )
        print("countries")

        def get_coordinates(row):
            encoded_state = urllib.parse.quote(row["State"])
            response = urllib.request.urlopen(f'https://nominatim.openstreetmap.org/search?format=json&limit=1&state={encoded_state}')
            data = json.load(response)
            if data: return data[0]['lat'], data[0]['lon']

            encoded_city = urllib.parse.quote(row["City"])
            response = urllib.request.urlopen(f'https://nominatim.openstreetmap.org/search?format=json&limit=1&city={encoded_city}')
            data = json.load(response)
            if data: return data[0]['lat'], data[0]['lon']

            encoded_country = urllib.parse.quote(row["Country"])
            response = urllib.request.urlopen(f'https://nominatim.openstreetmap.org/search?format=json&limit=1&country={encoded_country}')
            data = json.load(response)
            if data: return data[0]['lat'], data[0]['lon']  
        
        # read states
        states = subset_reader.read_entities(
            attr="State",
            builder=lambda row: State(
                name=row["State"],
                coordinates=get_coordinates(row)
            )
        )
        print("states")
        # read markets
        markets = subset_reader.read_entities(
            attr="Market",
            builder=lambda row: Market(
                name=row["Market"],
                region=row["Region"]
            )
        ) 
        print("markets")  
        # Read categories
        categories = subset_reader.read_entities(
            attr="Category",
            builder=lambda row: Category(
                name=row["Category"]
            )
        )
        print("categories")
        # Read subcategories
        subcategories = subset_reader.read_entities(
            attr="Sub-Category",
            builder=lambda row: Category(
                name=row["Sub-Category"],
                parent_category=categories[row["Category"]] if row["Category"] in categories else None
            )
        )
        print("subcategories")
        # read segments
        segments = subset_reader.read_entities(
            attr="Segment",
            builder=lambda row: Segment(row["Segment"])
        )
        print("segments")
        # read customers
        customers = subset_reader.read_entities(
            attr="Customer ID",
            builder=lambda row: Customer(
                id=row["Customer ID"],
                name=row["Customer Name"],
                segment=segments[row["Segment"]],
                address=Address(
                    city=row["City"],
                    country=countries[row["Country"]],
                    postal_code=row["Postal Code"],
                    state=states[row["State"]]
                )
            )
        )
        print("customers")
        # read orders
        orders = subset_reader.read_entities(
            attr="Order ID",
            builder=lambda row: Order(
                id=row["Order ID"],
                date=row["Order Date"],
                priority=row["Order Priority"],
                customer=customers[row["Customer ID"]],
                market=markets[row["Market"]],
                ship_info=Shipping(
                    date=row["Ship Date"],
                    mode=row["Ship Mode"],
                    cost=row["Shipping Cost"]
                )
            )
        )
        print("orders")
        def add_product_to_orders(order_product, row):
            orders[row["Order ID"]].add_order_product(order_product)

        # associate products and orders
        subset_reader.read_entities(
            attr="Row ID",
            builder=lambda row: OrderProduct(
                order_id=row["Order ID"],
                product_id=row["Product ID"],
                quantity=row["Quantity"], 
                discount=row["Discount"],
                sales=row["Sales"],
                profit=row["Profit"]
            ), 
            after_create=add_product_to_orders
        )
        print("order products")
        # read products
        products = subset_reader.read_entities(
            attr="Product ID",
            builder=lambda row: Product(
                id=row["Product ID"],
                name=row["Product Name"],
                category=subcategories[row["Sub-Category"]]
            ),
        )
        print("products")

        # generate the final xml
        root_el = ET.Element("Store")

        orders_el = ET.Element("Orders")
        for order in orders.values():
            orders_el.append(order.to_xml())

        markets_el = ET.Element("Markets")
        for market in markets.values():
            markets_el.append(market.to_xml())

        customers_el = ET.Element("Customers")
        for customer in customers.values():
            customers_el.append(customer.to_xml())

        segments_el = ET.Element("Segments")
        for segment in segments.values():
            segments_el.append(segment.to_xml())

        states_el = ET.Element("States")
        for state in states.values():
            states_el.append(state.to_xml())

        countries_el = ET.Element("Countries")
        for country in countries.values():
            countries_el.append(country.to_xml())

        products_el = ET.Element("Products")
        for product in products.values():
            products_el.append(product.to_xml())

        categories_el = ET.Element("Categories")
        for category in categories.values():
            categories_el.append(category.to_xml())

        for subcategory in subcategories.values():
            categories_el.append(subcategory.to_xml())

        root_el.append(orders_el)
        root_el.append(products_el)
        root_el.append(markets_el)
        root_el.append(customers_el)
        root_el.append(segments_el)
        root_el.append(states_el)
        root_el.append(countries_el)
        root_el.append(categories_el)
        return root_el

    def to_xml_str(self, current_part, total_parts):
        xml_str = ET.tostring(self.to_xml(current_part, total_parts), encoding='utf8', method='xml').decode()
        dom = md.parseString(xml_str)
        return dom.toprettyxml()