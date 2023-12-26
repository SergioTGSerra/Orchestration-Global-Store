import xml.etree.ElementTree as ET


class Category:

    def __init__(self, name, parent_category=None):
        Category.counter += 1
        self._id = Category.counter
        self._parent_category = parent_category
        self._name = name
        self._subcategories = []

    def add_subcategory(self, subcategory):
        self._subcategories.append(subcategory)

    def to_xml(self):
        el = ET.Element("Category")
        el.set("id", str(self._id))
        el.set("name", self._name)

        if self._parent_category:
            el.set("parent_category_id", str(self._parent_category.get_id()))

        for subcategory in self._subcategories:
            el.append(subcategory.to_xml())

        return el

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"


Category.counter = 0
