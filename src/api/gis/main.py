import json
import sys
import psycopg2
from flask_cors import CORS, cross_origin

from flask import Flask, g, request, jsonify

PORT = int(sys.argv[1]) if len(sys.argv) >= 2 else 9000

app = Flask(__name__)
app.config["DEBUG"] = True

CORS(app)

def connect_to_database():
    try:
        connection = psycopg2.connect(
            host="db-rel",
            port=5432,
            database="is",
            user="is",
            password="is"
        )
        return connection

    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        raise

def get_db():
    if 'db' not in g:
        g.db = connect_to_database()
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

@app.route('/api/states/<number_of_entities>', methods=['GET'])
@cross_origin()
def get_states(number_of_entities):
    try:
        connection = get_db()
        cursor = connection.cursor()

        query = "SELECT uuid, name, geom FROM states WHERE geom IS NULL LIMIT %s"
        cursor.execute(query, (number_of_entities,))

        states = cursor.fetchall()

        cursor.close()

        return jsonify(states)

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route('/api/tile', methods=['GET'])
@cross_origin()
def get_tile():
    try:
        connection = get_db()
        cursor = connection.cursor()

        # Return GeoJSON
        query = "SELECT jsonb_build_object('type', 'FeatureCollection', 'features', jsonb_agg(features.feature)) FROM (SELECT jsonb_build_object('type', 'Feature', 'geometry', ST_AsGeoJSON(s.geom)::jsonb, 'properties', to_jsonb(c) - 'geom' || jsonb_build_object('state_name', s.name)) AS feature FROM customers c INNER JOIN states s ON c.state = s.uuid WHERE s.geom IS NOT NULL AND ST_Intersects(s.geom::geometry(Geometry, 4326), ST_MakeEnvelope(%s, %s, %s, %s, 4326))) features;"
        cursor.execute(query, (request.args['neLat'], request.args['neLng'], request.args['swLat'], request.args['swLng'],))

        tile = cursor.fetchone()[0]

        cursor.close()

        return jsonify(tile)

    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route('/api/state/<state_id>', methods=['PATCH'])
@cross_origin()
def update_state(state_id):
    try:
        connection = get_db()
        cursor = connection.cursor()

        geom_json = json.dumps(request.json['geom'])

        query = "UPDATE states SET geom = ST_GeomFromGeoJSON(%s) WHERE uuid = %s"
        cursor.execute(query, (geom_json, state_id))

        connection.commit()

        cursor.close()

        return jsonify({"message": "State updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)})
    
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT)