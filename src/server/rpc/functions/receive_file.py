from functions.db_connection import DBConnection
from functions.csv_to_xml_converter import CSVtoXMLConverter
from functions.validate_xml import validate_xml

def receive_file(binary_data, file_name):
    with open(f'/data/{file_name}', 'wb') as handle:
        handle.write(binary_data.data)

    db = DBConnection()
    db.connect()

    result = db.execute_query_with_return("SELECT file_name FROM imported_documents WHERE file_name = %s AND is_deleted = false", (file_name,))
    
    if result:
        db.disconnect()
        return "File already exists"

    converter = CSVtoXMLConverter(f"/data/{file_name}")
    data = converter.to_xml_str()

    validation_result = validate_xml(data)
    if not validation_result:
        return "XML data does not conform to the XSD schema"
    
    db.execute_query("INSERT INTO imported_documents (file_name, xml) VALUES (%s, %s)", (file_name, data,))
    db.disconnect()

    return "File received successfully"