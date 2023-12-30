import xml.etree.ElementTree as ET

class Segment:

    def __init__(self, segment_name):
        Segment.counter += 1
        self._id = Segment.counter
        self._name = segment_name

    def to_xml(self):
        el = ET.Element("Segment")
        el.set("id", str(self._id))
        el.set("name", self._name)

        return el

    def get_id(self):
        return self._id

    def __str__(self):
        return f"name: {self._name}, id:{self._id}"

Segment.counter = 0
