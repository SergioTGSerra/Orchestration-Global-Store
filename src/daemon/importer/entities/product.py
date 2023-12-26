import xml.etree.ElementTree as ET

class Product:

    def __init__(self, id, name, category):
        self._id = id
        self._name = name
        self._category = category

    def to_xml(self):
        el = ET.Element("Product")
        el.set("id", str(self._id))
        el.set("name", self._name)
        el.set("category_ref", str(self._category.get_id()))
        return el

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"
        
Product.counter = 0