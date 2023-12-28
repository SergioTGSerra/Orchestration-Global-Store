import sys
import xmlrpc.client
from converter import convert_xml_to_json, merge_xml_element, get_parent_element

from flask import Flask

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000

app = Flask(__name__)
app.config["DEBUG"] = True

server = xmlrpc.client.ServerProxy('http://rpc-server:9000') 

@app.route('/api/ordersByPriority', methods=['GET'])   
def get_orders_by_priority():
    xml = ""
    if(server.show_files()):
        for file in server.show_files():
            xml += server.get_orders_order_by_priority(file[1])
    xml = merge_xml_element(xml, get_parent_element(xml))
    return convert_xml_to_json(xml)

@app.route('/api/ordersByCost/<int:id>', methods=['GET'])
def get_orders_by_cost(id):
    xml = ""
    if(server.show_files()):
        for file in server.show_files():
            xml += server.get_orders_by_market_order_by_shipping_cost(id, file[1])
    xml = merge_xml_element(xml, get_parent_element(xml))
    return convert_xml_to_json(xml)

@app.route('/api/retrieveCustomer', methods=['GET'])   
def get_costumer_info_with_address_details():
    xml = ""
    if(server.show_files()):
        for file in server.show_files():
            xml += server.retrieve_customer_information_with_address_details(file[1])
    xml = merge_xml_element(xml, get_parent_element(xml))  
    return convert_xml_to_json(xml)

@app.route('/api/countCostumersBySegment', methods=['GET'])   
def count_the_number_of_customers_by_segment_server():
    xml = ""
    if(server.show_files()):
        for file in server.show_files():
            xml += server.count_the_number_of_customers_by_segment_server(file[1])
    xml = merge_xml_element(xml, get_parent_element(xml))        
    return convert_xml_to_json(xml)

@app.route('/api/orderCustomerWithGeoInfo', methods=['GET'])   
def get_order_and_customer_details_with_geographic_information():
    xml = ""
    if(server.show_files()):
        for file in server.show_files():
            xml += server.get_order_and_customer_details_with_geographic_information(file[1])
    xml = merge_xml_element(xml, get_parent_element(xml))
    return convert_xml_to_json(xml)


@app.route('/api/best_players', methods=['GET'])
def get_best_players():
    return [{
        "id": "7674fe6a-6c8d-47b3-9a1f-18637771e23b",
        "name": "Ronaldo",
        "country": "Portugal",
        "position": "Striker",
        "imgUrl": "https://cdn-icons-png.flaticon.com/512/805/805401.png",
        "number": 7
    }]

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)