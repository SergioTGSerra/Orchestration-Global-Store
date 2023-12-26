import xml.etree.ElementTree as ET


class Address:

    def __init__(self, country, city, state, postal_code):
        self._country = country
        self._city = city
        self._state = state
        self._postal_code = postal_code

    def to_xml(self):
        el = ET.Element("Address")
        el.set("country_ref", str(self._country.get_id()))
        el.set("state_ref", str(self._state.get_id()))
        el.set("city", self._city)
        el.set("postal_code", self._postal_code)
        
        return el

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"