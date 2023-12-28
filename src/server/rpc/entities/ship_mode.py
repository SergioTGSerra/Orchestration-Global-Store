import xml.etree.ElementTree as ET

class ShipMode:

    def __init__(self, name):
        self._id = ShipMode.counter
        ShipMode.counter += 1
        self._name = name
        self._orders = []

    def to_xml(self):
        ship_mode_element = ET.Element("ShipMode")  
        ship_mode_element.set("id", str(self._id))
        ship_mode_element.set("name", self._name)

        for order in self._orders:
            order_element = ET.Element("Order")
            order_element.text = str(order.get_id())
            ship_mode_element.append(order_element)

        return ship_mode_element

    def add_order(self, order):
        self._orders.append(order)

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"
    
ShipMode.counter = 0
