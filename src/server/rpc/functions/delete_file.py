from functions.db_connection import DBConnection

def delete_file(file_id):
    db = DBConnection()
    db.connect()
    db.execute_query("Update imported_documents set is_deleted = true where id = %s", (file_id,))
    db.disconnect()

    return "File deleted successfully"