
from lxml import etree
from io import BytesIO

def validate_xml(data):
    with open("/xsd/Global_Superstore2.xsd", 'rb') as xsd_file:
        xsd = xsd_file.read()

    try:
        xmlschema_doc = etree.parse(BytesIO(xsd))
        xmlschema = etree.XMLSchema(xmlschema_doc)
        doc = etree.parse(BytesIO(data.encode()), parser=etree.XMLParser(encoding='utf-8', remove_blank_text=True))
        xmlschema.assertValid(doc)
        return True
    except Exception as e:
        print(e)
        return False