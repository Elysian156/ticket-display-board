from models.db import connectDatabase
from datetime import datetime

database = connectDatabase()
databaseCursor = database.cursor()

def fetch_last_password(urgencyLevel, isPriority):
  passwordIsPriority = 1 if isPriority else 0
  databaseCursor.execute(f"SELECT * FROM passwords WHERE urgency_level = '{urgencyLevel}' AND is_priority = '{passwordIsPriority}' ORDER BY id DESC LIMIT 1")
  last_password = databaseCursor.fetchall()
  if(last_password):
    last_password = last_password[0]
    return {
      'id': last_password[0],
      'order': last_password[1],
      'is_attended': last_password[2],
      'created_at': last_password[3],
      'date_attended': last_password[4],
      'user_id': last_password[5],
      'is_priority': last_password[6],
      'urgency_level': last_password[7],
      'unformatedPassword': last_password[8]
    }
  return None

def createPassword(order, isPriority, urgencyLevel, userId, unformatedPassword):
  passwordIsPriority = 1 if isPriority else 0
  nowDate = datetime.now()
  query = f"INSERT INTO `passwords` (`id`, `order`, `is_attended`, `created_at`, `user_id`, `is_priority`, `urgency_level`, `unformated_password`) VALUES (NULL, '{order}', '0', '{nowDate}', '{userId}', '{passwordIsPriority}', '{urgencyLevel}', '{unformatedPassword}');"

  databaseCursor.execute(query)
  database.commit()

  databaseCursor.execute("SELECT LAST_INSERT_ID();")

  last_inserted_id = databaseCursor.fetchall()
  if(last_inserted_id):
    return last_inserted_id[0]
  return []

def fetchPasswords():
  query = "SELECT * FROM passwords"
  databaseCursor.execute(query)
  passwords = databaseCursor.fetchall()
  if(passwords):
    passwordsList = list()
    for password in passwords:
      passwordsList.append({
        'id': password[0],
        'order': password[1],
        'is_attended': password[2],
        'created_at': password[3],
        'date_attended': password[4],
        'user_id': password[5],
        'is_priority': password[6],
        'urgency_level': password[7],
        'unformatedPassword': password[8]
      })
    return passwordsList
  return []

def fecthOnePasswordByCode(password):
  print(password)
  passwordsList = fetchPasswords()
  findedPassword = ""
  for item in passwordsList:
    splitedPassword = item["unformatedPassword"].split('.')
    formatedPassword = splitedPassword[0] + splitedPassword[1] + splitedPassword[2]
    findedPassword = item if formatedPassword == password else findedPassword
  return findedPassword

def checkoutPassword(idPassword):
  nowDate = datetime.now()
  query = f"UPDATE `passwords` SET `date_attended` = '{nowDate}' WHERE `passwords`.`id` = {idPassword};"
  databaseCursor.execute(query)
  database.commit()

def findPasswordWithPassword(password):
  query = f"SELECT * FROM passwords where `unformated_password` = '{password}'"
  databaseCursor.execute(query)
  findedUserIdInPassword = databaseCursor.fetchall()[0][5]
  queryUsers = f"SELECT name, eligibility_reason FROM users WHERE id = '{findedUserIdInPassword}'"
  databaseCursor.execute(queryUsers)
  user = databaseCursor.fetchall()[0]
  return user