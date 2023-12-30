import xml.etree.ElementTree as ET


class Shipping:

    def __init__(self, date, mode, cost):
        self._date = date
        self._mode = mode
        self._cost = cost

    def to_xml(self):
        el = ET.Element("Shipping")
        el.set("date", self._date)
        el.set("mode", self._mode)
        el.set("cost", self._cost)
        
        return el

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"