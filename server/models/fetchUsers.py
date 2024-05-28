from models.db import connectDatabase

def fetchUsers():
    # Conecte ao banco de dados e crie um cursor para cada operação
    database = connectDatabase()
    with database.cursor() as cursor:
        cursor.execute('SELECT * FROM users')
        users_list = cursor.fetchall()
    
    users = [
        {
            'id': item[0],
            'name': item[1],
            'cpf': item[2],
            'date_birthday': item[3],
            'is_especial': item[4],
            'eligibility_reason': item[5]
        }
        for item in users_list
    ]
    return users

def getUserById(userId):
    # Conecte ao banco de dados e crie um cursor para cada operação
    database = connectDatabase()
    with database.cursor() as cursor:
        query = 'SELECT * FROM users WHERE id = %s'
        cursor.execute(query, (userId,))
        user = cursor.fetchone()
    return user

def getUserByCPF(cpf):
    # Conecte ao banco de dados e crie um cursor para cada operação
    database = connectDatabase()
    with database.cursor() as cursor:
        query = 'SELECT * FROM users WHERE cpf = %s'
        cursor.execute(query, (cpf,))
        user = cursor.fetchone()
    return user
  
