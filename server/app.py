from flask import Flask, request, jsonify
from flask_cors import CORS

import json

from models.fetchUsers import fetchUsers, getUserById
from models.createNewUser import createUser
from models.passwords import fetch_last_password, createPassword, fetchPasswords

from utils.generate_password import generatePassword
from utils.reorder_queue_by_priority import organizeQueue

from lib.json import createJson, readJson

app = Flask(__name__)
CORS(app)

@app.route('/api/users')
def fetch_users():
  return fetchUsers()

@app.route('/api/users/add', methods=["POST"])
def create_user():
  userData = request.json

  cpf = userData["cpf"]
  date_birthday = userData["date_birthday"]
  name = userData["name"]
  is_especial = userData["is_especial"]
  deficiency = userData.get("deficiency", " ")
  isCreatedUser = createUser(name, cpf, date_birthday, is_especial, deficiency)

  if(isCreatedUser):
    return jsonify({ 'message': 'Usuário cadastrado com sucesso!' }), 201
  else:
    return jsonify({ 'message': 'Não foi possível cadastrar o usuário' }), 400
  
@app.route('/api/users/<int:userId>', methods=["GET"])
def search_user(userId):
  user = getUserById(userId)[0]
  if(user):
    user_id = user[0]
    name = user[1]
    cpf = user[2]
    date_birthday = user[3]
    is_especial = user[4]
    deficiency = user[5]
    return jsonify({ 'id': user_id, 'name': name, 'cpf': cpf, 'date_birthday': date_birthday, 'is_especial': is_especial, 'deficiency': deficiency })
  else:
    return jsonify({ 'message': "Usuário não encontrado" }), 404

@app.route('/api/passwords/create', methods=["POST"])
def create_password():
  passwordData = request.json

  userId = passwordData["user_id"]
  isPriority = passwordData.get("is_priority")
  urgencyLevel = (passwordData["urgency_level"]).upper()

  isHaveLastPassword = fetch_last_password(urgencyLevel, isPriority)
  order = 1
  if(isHaveLastPassword):
    order = isHaveLastPassword["order"] + 1

  password = generatePassword(callOrder=order, isPriority=isPriority, levelUrgency=urgencyLevel)
  unformatedPassword = password['password']
  last_inserted_id = createPassword(order, isPriority, urgencyLevel, userId, unformatedPassword)
  order = 1
  if(last_inserted_id):
    lastPasswords = fetchPasswords()
    lastJson = readJson()
    oldQueue = [unformatedPassword]

    if(len(lastPasswords) > 0):
      for item in lastPasswords:
        oldQueue.append(item["unformatedPassword"])

    reorderedQueue = organizeQueue(oldQueue)
    data = {
      'boxes': lastJson['boxes'],
      'queue': [*reorderedQueue]
    }

    print(data)

    dataJson = json.dumps(data)
    createJson(data=dataJson)
    return jsonify({ 'id': last_inserted_id, 'password': password["formatedPassword"] }), 201
  return jsonify({ 'message': "Não foi possível cadastrar uma nova senha" }), 400

@app.route('/api/passwords/next', methods=['GET'])
def get_next_password():
  dataJson = readJson()
  queue = dataJson["queue"]
  boxes = dataJson["boxes"]
  if(len(queue) == 0):
    return jsonify({ 'message': "Não há ninguém na fila de espera" }), 200
  '''
    os boxes (receptions_number) 0 e 1 têm que ser preferenciais, o restante tudo normal!!
  '''

  proximoDaFila = queue[0]
  fifo = proximoDaFila.split('.')
  reception_number = 1
  if(fifo[0] == 'P'):
    if(boxes[0] == 0):
      boxes[0] = proximoDaFila
    elif(boxes[0] != 0 and boxes[1] == 0):
      boxes[1] = proximoDaFila
      reception_number = 2
    elif(boxes[0] != 0 and boxes[1] != 0):
      return jsonify({ 'message': "Aguardando liberação da recepção 1" }), 400
  else:
    if(boxes[2] == 0):
      boxes[2] = proximoDaFila
      reception_number = 3
    elif(boxes[2] != 0 and boxes[3] == 0):
      boxes[3] = proximoDaFila
      reception_number = 4
    elif(boxes[2] != 0 and boxes[3] != 0 and boxes[4] == 0):
      boxes[4] = proximoDaFila
      reception_number = 5
    elif(boxes[2] != 0 and boxes[3] != 0 and boxes[4] != 0):
      return jsonify({ 'message': "Aguardando liberação da recepção 2" }), 400
  
  print(queue)
  newQueue = queue[1:] if queue else queue
  dataJson = {
    'boxes': boxes,
    'queue': newQueue
  }

  # print(dataJson)
  createJson(data=json.dumps(dataJson))
  
  appointment_number = fifo[0] + fifo[1] + fifo[2]
  response_data = {
      'appointment_number': appointment_number,
      'reception_number': reception_number
  }
  return jsonify(response_data)
  
if __name__ == "__main__":
  app.run(debug=True)
