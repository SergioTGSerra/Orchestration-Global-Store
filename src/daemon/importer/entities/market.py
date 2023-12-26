import xml.etree.ElementTree as ET


class Market:

    def __init__(self, name, region):
        self._id = Market.counter
        Market.counter += 1
        self._name = name
        self._region = region
        self._orders = []

    def to_xml(self):
        el = ET.Element("Market")
        el.set("id", str(self._id))
        el.set("name", self._name)
        el.set("region", self._region)

        for order in self._orders:
            order_el = ET.Element("Order")
            order_el.text = order
            el.append(order_el)

        return el

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"

Market.counter = 0