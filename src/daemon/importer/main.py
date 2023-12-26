import asyncio
import time
import uuid

import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent
from utils.db_connection import DBConnection

from utils.to_xml_converter import CSVtoXMLConverter

def get_csv_files_in_input_folder():
    return [os.path.join(dp, f) for dp, dn, filenames in os.walk(CSV_INPUT_PATH) for f in filenames if
            os.path.splitext(f)[1] == '.csv']

def generate_unique_file_name(directory):
    return f"{directory}/{str(uuid.uuid4())}.xml"

def convert_csv_to_xml(in_path, out_path, current_part, total_parts):
    converter = CSVtoXMLConverter(in_path)
    file = open(out_path, "w")
    file.write(converter.to_xml_str(current_part, total_parts))

def store_xml_file_in_database(xml_path, data):
    db = DBConnection()
    db.connect()

    db.execute_query("INSERT INTO imported_documents (file_name, xml) VALUES (%s, %s)", (xml_path, data,))
    db.disconnect()  

def store_csv_file_in_database(csv_path):
    db = DBConnection()
    db.connect()

    db.execute_query("INSERT INTO converted_documents (src, file_size, dst) VALUES (%s, %s, %s)", (csv_path, os.path.getsize(csv_path), csv_path,))
    db.disconnect()

def get_converted_files_in_database(csv_path):
    db = DBConnection()
    db.connect()

    result = db.execute_query_with_return("SELECT src FROM converted_documents WHERE src = %s", (csv_path,))
    db.disconnect()
    return result

def read_xml_file(xml_path):
    with open(xml_path, 'r') as file:
        content = file.read()
    return content

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

        result = get_converted_files_in_database(csv_path)
        if result:
            file_path = result[0][0]
        else:
            file_path = ""

        if csv_path in file_path:
            print("File already converted")
            return
                
        store_csv_file_in_database(csv_path)

        print(f"new file to convert: '{csv_path}'")
        
        num_xml_parts_str = int(os.environ.get('NUM_XML_PARTS'))

        total_parts = num_xml_parts_str

        for current_part in range(total_parts):
            # we generate a unique file name for the XML file
            xml_path = generate_unique_file_name(self._output_path)

            # we do the conversion
            # once the conversion is done, we should update the converted_documents table
            convert_csv_to_xml(csv_path, xml_path, current_part, total_parts)
            print(f"new xml file generated: '{xml_path}'")

            # we should store the XML document into the imported_documents table
            data = read_xml_file(xml_path)

            store_xml_file_in_database(xml_path, data)

    async def get_converted_files(self, csv_path):
        # you should retrieve from the database the files that were already converted before
        return get_converted_files_in_database(csv_path)

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