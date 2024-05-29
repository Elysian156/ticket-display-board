from models.db import connectDatabase
def createUser(name, cpf, date_birthday, is_especial, eligibility_reason):
    database = connectDatabase()
    query = """
        INSERT INTO users (name, cpf, date_birthday, is_especial, eligibility_reason)
        VALUES (%s, %s, %s, %s, %s);
    """
    try:
        with database.cursor() as cursor:
            print()
            cursor.execute(query, (name, cpf, date_birthday, is_especial, eligibility_reason))
            database.commit()
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False

