import sys
import time
import requests
import pika
import time

POLLING_FREQ = int(sys.argv[1]) if len(sys.argv) >= 2 else 60
ENTITIES_PER_ITERATION = int(sys.argv[2]) if len(sys.argv) >= 3 else 10

# !TODO: 1- Use api-gis to retrieve a fixed amount of entities without coordinates (e.g. 100 entities per iteration, use ENTITIES_PER_ITERATION)
def get_entities_without_coordinates():
    try:
        apiUrl = "http://api-gis:8080/api/states/" + str(ENTITIES_PER_ITERATION)
        response = requests.get(apiUrl)
        if response.status_code == 200:
            entities = response.json()
            print (entities)
            return entities
        else:
            print(f"Failed to get entities. Status code: {response.status_code}")
            return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

# !TODO: 2- Use the entity information to retrieve coordinates from an external API
def get_coordinates(entity):
    try:
        apiUrl = "https://nominatim.openstreetmap.org/search?format=json&limit=1&state=" + entity[1]
        response = requests.get(apiUrl)
        
        if response.status_code == 200:
            json_data = response.json()
            
            if json_data:  
                coordinates = json_data[0]['lat'], json_data[0]['lon']
                print(coordinates)
                return coordinates
            else:
                print("No coordinates found in the response.")
                return []
        else:
            print(f"Failed to get coordinates. Status code: {response.status_code}")
            return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

# !TODO: 3- Submit the changes
def update_entity(entity, coordinates):
    try:
        apiUrl = "http://api-gis:8080/api/state/" + entity[0]
        response = requests.patch(apiUrl, json={"geom": {"type": "Point", "coordinates": coordinates}})
        if response.status_code == 200:
            print(f"Updated {entity[1]}")
        else:
            print(f"Failed to update {entity[1]}. Status code: {response.status_code}")
    except Exception as e:
        print(f"An error occurred: {e}")

# RabbitMQ
def connect_to_rabbitmq(max_retries=10, retry_delay=5):
    for attempt in range(1, max_retries + 1):
        try:
            connection_params = pika.URLParameters('amqp://is:is@rabbitmq:5672/is')
            connection = pika.BlockingConnection(connection_params)
            channel = connection.channel()
            channel.queue_declare(queue="Geospatial_Tasks")
            return channel

        except Exception as e:
            print(f"Failed to connect to RabbitMQ (Attempt {attempt}/{max_retries}): {str(e)}")
            if attempt < max_retries:
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Maximum number of retries ({max_retries}) reached. Unable to connect.")
                raise


def callback(ch, method, properties, body):
    print(f"Received {body}")
    entities = get_entities_without_coordinates()
    for entity in entities:
        print(f"Getting coordinates for {entity[1]}...")
        coordinates = get_coordinates(entity)
        if len(coordinates) > 0:
            print(f"Updating {entity[1]} with coordinates...")
            update_entity(entity, coordinates)
    
    ch.basic_ack(delivery_tag=method.delivery_tag)

def consume_rabbitmq_messages(channel):
    try:
        channel.basic_consume(queue="Geospatial_Tasks", on_message_callback=callback)
        print('Waiting for messages. To exit press CTRL+C')
        channel.start_consuming()

    except Exception as e:
        print(f"An error occurred while consuming RabbitMQ messages: {e}")

if __name__ == "__main__":
    channel = connect_to_rabbitmq()

    while True:
        consume_rabbitmq_messages(channel)
        time.sleep(POLLING_FREQ)