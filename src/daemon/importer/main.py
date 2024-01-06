import asyncio
import time
import uuid
import xml.etree.ElementTree as ET
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent
from utils.db_connection import DBConnection
from utils.csv_to_xml_converter import CSVtoXMLConverter

def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']

def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"

def convert_csv_to_xml(in_path, out_path, num_parts):
    converter = CSVtoXMLConverter(in_path)
    xml_parts = converter.to_xml_str(num_parts)
    file_data = []
    for i, xml_part in enumerate(xml_parts):
        file_name = f"{out_path}_{i}.xml"
        file_data.append([file_name, xml_part])
        with open(file_name, 'w') as file:
            file.write(xml_part)
    return file_data

def store_xml_file_in_database(xml_path, data):
    db_connection = DBConnection()
    db_connection.execute_query("INSERT INTO imported_documents (file_name, xml) VALUES (%s, %s)", (xml_path, data))

def store_csv_file_in_database(csv_path):
    db_connection = DBConnection()
    db_connection.execute_query("INSERT INTO converted_documents (src, file_size, dst) VALUES (%s, %s, %s)", (csv_path, os.path.getsize(csv_path), csv_path,))

class CSVHandler(FileSystemEventHandler):
    def __init__(self, input_path, output_path):
        self._output_path = output_path
        self._input_path = input_path

        # generate file creation events for existing files
        for file in [os.path.join(dp, f) for dp, dn, filenames in os.walk(input_path) for f in filenames]:
            event = FileCreatedEvent(os.path.join(CSV_INPUT_PATH, file))
            event.event_type = "created"
            self.dispatch(event)

    async def convert_csv(self, csv_path):
        # here we avoid converting the same file again
        # check converted files in the database
        if csv_path in await self.get_converted_files():
            return
                
        store_csv_file_in_database(csv_path)
        
        num_xml_parts_str = int(os.environ.get('NUM_XML_PARTS'))

        # we generate a unique file name for the XML file
        xml_path = generate_unique_file_name(self._output_path)

        # we do the conversion
        # once the conversion is done, we should update the converted_documents table
        for file_data in convert_csv_to_xml(csv_path, xml_path, num_xml_parts_str):
            store_xml_file_in_database(file_data[0], file_data[1])
        
        print(f"Conversion done for {csv_path} at {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())}")

    async def get_converted_files(self):
        db_connection = DBConnection()
        result = db_connection.execute_query_with_return("SELECT src FROM converted_documents", ())
        return result

    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith(".csv"):
            asyncio.run(self.convert_csv(event.src_path))


if __name__ == "__main__":

    CSV_INPUT_PATH = "/csv"
    XML_OUTPUT_PATH = "/xml"

    # create the file observer
    observer = Observer()
    observer.schedule(
        CSVHandler(CSV_INPUT_PATH, XML_OUTPUT_PATH),
        path=CSV_INPUT_PATH,
        recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        observer.join()