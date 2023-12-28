import xml.etree.ElementTree as ET

class Order:

    def __init__(self, id, date, priority, customer, market, ship_info):
        self._id = id
        self._date = date
        self._priority = priority
        self._market = market
        self._customer = customer
        self._ship_info = ship_info
        self._order_products = []

    def add_order_product(self, order_product):
        self._order_products.append(order_product)

    def to_xml(self):
        el = ET.Element("Order")
        el.set("id", self._id)
        el.set("date", self._date)
        el.set("priority", self._priority)
        el.set("customer_ref", str(self._customer.get_id()))
        el.set("market_ref", str(self._market.get_id()))
        el.append(self._ship_info.to_xml())

        products_element = ET.Element("Products")
        for order_product in self._order_products:
            products_element.append(order_product.to_xml())
        el.append(products_element)

        return el

    def get_id(self):
        return self._id

    def __str__(self):
        return f"Order ID: {self._id}, Order Date: {self._order_date}, Ship Date: {self._ship_date}"