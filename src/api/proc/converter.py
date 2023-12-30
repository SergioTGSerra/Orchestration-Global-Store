import xmltodict
import json
import re

def convert_xml_to_json(xml):    
    data_dict = xmltodict.parse(xml)
    json_data = json.dumps(data_dict)
    json_data = json_data.replace("@", "")    
    return json_data

def merge_xml_element(xml, element_name):
    xml = xml.replace("No results found", "")
    pattern = fr"<{element_name}>(.*?)</{element_name}>"
    matches = re.findall(pattern, xml, re.DOTALL)
    merged_element = f"<{element_name}>" + " ".join(matches) + f"</{element_name}>"
    return merged_element

def get_parent_element(xml):
    pattern = r"<(.*?)>"
    match = re.findall(pattern, xml)
    return match[0]