import psycopg2

class DBConnection:
    def __init__(self):
        self.connection = None

    def connect(self):
        self.connection = psycopg2.connect(
            user="is",
            password="is",
            host="db-xml",
            port="5432",
            database="is"
        )

    def disconnect(self):
        self.connection.close()

    def execute_query(self, query, values):
        cursor = self.connection.cursor()
        cursor.execute(query, values)
        self.connection.commit()
        cursor.close()

    def execute_query_with_return(self, query, values):
        cursor = self.connection.cursor()
        cursor.execute(query, values)
        result = cursor.fetchall()
        cursor.close()
        return result