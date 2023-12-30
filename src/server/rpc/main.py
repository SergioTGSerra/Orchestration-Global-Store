import signal, sys
from xmlrpc.server import SimpleXMLRPCServer
from xmlrpc.server import SimpleXMLRPCRequestHandler

from functions.delete_file import delete_file
from functions.show_files import show_files
from functions.queries import *

class RequestHandler(SimpleXMLRPCRequestHandler):
    rpc_paths = ('/RPC2',)

with SimpleXMLRPCServer(('0.0.0.0', 9000), requestHandler=RequestHandler) as server:
    server.register_introspection_functions()

    def signal_handler(signum, frame):
        print("received signal")
        server.server_close()

        # perform clean up, etc. here...

        print("exiting, gracefully")
        sys.exit(0)

    # signals
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGHUP, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    # register both functions
    server.register_function(delete_file, 'delete_file')
    server.register_function(show_files, 'show_files')
    server.register_function(get_orders_order_by_priority, 'get_orders_order_by_priority')
    server.register_function(get_orders_by_market_order_by_shipping_cost, 'get_orders_by_market_order_by_shipping_cost')
    server.register_function(retrieve_customer_information_with_address_details, 'retrieve_customer_information_with_address_details')
    server.register_function(count_the_number_of_customers_by_segment_server, 'count_the_number_of_customers_by_segment_server')
    server.register_function(get_order_and_customer_details_with_geographic_information, 'get_order_and_customer_details_with_geographic_information')
    server.register_function(get_markets, 'get_markets')

    # start the server
    print("Starting the RPC Server...")
    server.serve_forever()

