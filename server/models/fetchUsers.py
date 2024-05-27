from models.db import connectDatabase

database = connectDatabase()
databaseCursor = database.cursor()

def fetchUsers():
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
  query = f'SELECT * FROM users WHERE id = {userId}'
  databaseCursor.execute(query)
  user = databaseCursor.fetchall()
  return user

def getUserByCPF(cpf):
  query = f"SELECT * FROM users WHERE cpf = '{cpf}'"
  databaseCursor.execute(query)
  user = databaseCursor.fetchall()
  return user