from functions.db_connection import DBConnection

def show_files():
    db = DBConnection()
    db.connect()
    result = db.execute_query_with_return("SELECT id, file_name FROM imported_documents", ())
    db.disconnect()

    return result