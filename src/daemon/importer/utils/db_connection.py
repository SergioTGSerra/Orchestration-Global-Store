import psycopg2
import time

class DBConnection:
    _instance = None
    _connection = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DBConnection, cls).__new__(cls)
            cls._instance._connect()
        return cls._instance

    def _connect(self):

        max_attempts = 20
        attempts = 0

        while attempts < max_attempts:
            try:
                self.connection = psycopg2.connect(
                    user="is",
                    password="is",
                    host="db-xml",
                    port="5432",
                    database="is"
                )
                print("Connection to database successful!")
                break
            except Exception:
                attempts += 1
                time.sleep(2)

        if attempts == max_attempts:
            print(f"Max attempts reached. Could not establish a connection.")

    def disconnect(self):
        self.connection.close()

    def execute_query(self, query, values):
        cursor = self.connection.cursor()
        cursor.execute(query, values)
        self.connection.commit()
        cursor.close()

    def execute_query_with_return(self, query, values=None):
        cursor = self.connection.cursor()
        cursor.execute(query, values)
        result = cursor.fetchall()
        cursor.close()
        return result