from models.db import connectDatabase

database = connectDatabase()

def fetchUsers():
  database = connectDatabase()
  with database.cursor() as databaseCursor:
    databaseCursor.execute('SELECT * FROM users')

    users_list = databaseCursor.fetchall()
    users = list()
    for item in users_list:
      users.append(
        {
          'id': item[0],
          'name': item[1],
          'cpf': item[2],
          'date_birthday': item[3],
          'is_especial': item[4],
          'eligibility_reason': item[5]
        }
      )
  return users

def getUserById(userId):
  database = connectDatabase()
  query = f'SELECT * FROM users WHERE id = {userId}'
  with database.cursor() as databaseCursor:
    databaseCursor.execute(query)
    user = databaseCursor.fetchall()
  return user

def getUserByCPF(cpf):
  database = connectDatabase()
  query = f"SELECT * FROM users WHERE cpf = '{cpf}'"
  with database.cursor() as databaseCursor:
    databaseCursor.execute(query)
    user = databaseCursor.fetchall()[0]
  return user