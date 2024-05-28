from models.db import connectDatabase


def createUser(name, cpf, date_birthday, is_especial, eligibility_reason):
  database = connectDatabase()
  with database.cursor() as cursor:
    query = f"INSERT INTO `users` (`id`, `name`, `cpf`, `date_birthday`, `is_especial`, `eligibility_reason`) VALUES (NULL, '{name}', '{cpf}', '{date_birthday}', '{is_especial}', '{eligibility_reason}');"
    try:
      cursor.execute(query)
      database.commit()
      return True
    except:
      return False