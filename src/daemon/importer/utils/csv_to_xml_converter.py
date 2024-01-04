import xml.dom.minidom as md
import xml.etree.ElementTree as ET
import urllib.parse
import urllib.request
import json

from utils.csv_reader import CSVReader
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

    def count_lines(self):
        # Count the number of lines in the CSV file
        with open(self._reader._path, 'r', encoding='utf-8') as file:
            line_count = sum(1 for line in file)
        return line_count

    def divide_csv_and_convert(self, num_parts):
        if not isinstance(num_parts, int) or num_parts <= 0:
            raise ValueError("Number of parts must be a positive integer")

        total_rows = self.count_lines()
        rows_per_part = total_rows // num_parts

        xml_parts = []

        for part_num in range(num_parts):
            start_index = part_num * rows_per_part
            end_index = (part_num + 1) * rows_per_part if part_num < num_parts - 1 else total_rows

            self._reader = CSVReader(self._reader._path, start=start_index, end=end_index)
            xml_parts.append(self.to_xml())

        print(f"XML parts: {len(xml_parts)}")

        return xml_parts

    def to_xml(self):
        
        # read countries
        countries = self._reader.read_entities(
            attr="Country",
            builder=lambda row: Country(row["Country"])
        )

        # read states
        states = self._reader.read_entities(
            attr="State",
            builder=lambda row: State(
                name=row["State"]
            )
        )

        # read markets
        markets = self._reader.read_entities(
            attr="Market",
            builder=lambda row: Market(
                name=row["Market"],
                region=row["Region"]
            )
        ) 

        # Read categories
        categories = self._reader.read_entities(
            attr="Category",
            builder=lambda row: Category(
                name=row["Category"]
            )
        )

        # Read subcategories
        subcategories = self._reader.read_entities(
            attr="Sub-Category",
            builder=lambda row: Category(
                name=row["Sub-Category"],
                parent_category=categories[row["Category"]] if row["Category"] in categories else None
            )
        )

        # read segments
        segments = self._reader.read_entities(
            attr="Segment",
            builder=lambda row: Segment(row["Segment"])
        )

        # read customers
        customers = self._reader.read_entities(
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

        # read orders
        orders = self._reader.read_entities(
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

        def add_product_to_orders(order_product, row):
            orders[row["Order ID"]].add_order_product(order_product)

        # associate products and orders
        self._reader.read_entities(
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

        # read products
        products = self._reader.read_entities(
            attr="Product ID",
            builder=lambda row: Product(
                id=row["Product ID"],
                name=row["Product Name"],
                category=subcategories[row["Sub-Category"]]
            ),
        )

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

    def to_xml_str(self, num_parts):
        xml_parts = self.divide_csv_and_convert(num_parts)
        
        pretty_xml_parts = []

        for xml_part in xml_parts:
            xml_str = ET.tostring(xml_part, encoding='utf8', method='xml').decode()
            dom = md.parseString(xml_str)
            xml_str_pretty = dom.toprettyxml()
            pretty_xml_parts.append(xml_str_pretty)

        return pretty_xml_parts