import xml.etree.ElementTree as ET

class Priority:

    def __init__(self, name):
        self._id = Priority.counter
        Priority.counter += 1
        self._name = name
        self._orders = []

    def to_xml(self):
        priority_element = ET.Element("Priority")  
        priority_element.set("id", str(self._id))
        priority_element.set("name", self._name)

        for order in self._orders:
            order_element = ET.Element("Order")
            order_element.text = str(order.get_id())
            priority_element.append(order_element)

        return priority_element

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"

Priority.counter = 0