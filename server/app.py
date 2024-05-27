from flask import Flask, request, jsonify
from flask_cors import CORS

import json

from models.fetchUsers import fetchUsers, getUserByCPF
from models.createNewUser import createUser
from models.passwords import fetch_last_password, createPassword, fetchPasswords, fecthOnePasswordByCode, checkoutPassword, findPasswordWithPassword

from utils.generate_password import generatePassword, formatPassword
from utils.reorder_queue_by_priority import organizeQueue
from utils.reorder_boxes import reorderBoxes

from lib.json import createJson, readJson, returnBoxesAndQueue

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
  
@app.route('/api/users/<cpf>', methods=["GET"])
def search_user(cpf):
  user = getUserByCPF(cpf)[0]
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
        if((item["date_attended"] == None) and (not item["unformatedPassword"] in lastJson["boxes"])):
          oldQueue.append(item["unformatedPassword"])

    reorderedQueue = organizeQueue(oldQueue)
    data = {
      'boxes': lastJson['boxes'],
      'queue': [*reorderedQueue]
    }

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
  lotacao = 0
  for box in boxes:
    lotacao += 1 if box != 0 else 0
  
  index, reception_number, fifo, boxes = reorderBoxes(data=dataJson, index=0)
  print(reception_number)
  if(lotacao == 5 or reception_number == -1):
    return jsonify({ 'message': "Aguarde liberação" }), 400

  queue.pop(index)
  dataJson = {
    'boxes': boxes,
    'queue': queue
  }
  createJson(data=json.dumps(dataJson))
  
  appointment_number = fifo[0] + fifo[1] + fifo[2]

  [name, eligibility_reason] = findPasswordWithPassword(f"{fifo[0]}.{fifo[1]}.{fifo[2]}")

  response_data = {
      'appointment_number': appointment_number,
      'reception_number': reception_number,
      'name': name,
      'eligibility_reason': eligibility_reason
  }
  return jsonify(response_data)

@app.route('/api/passwords/checkout/<password>', methods=["PATCH"])
def password_checkout(password):
  findedPassword = fecthOnePasswordByCode(password)
  
  if(len(findedPassword) <= 0):
    return jsonify({ 'message': "Senha não encontrada" }), 400
  
  elif(findedPassword["date_attended"] != None):
    return jsonify({ 'message': "Essa senha já foi atendida" }), 400
  
  dataFromJson = readJson()
  queue = dataFromJson["queue"]
  boxes = dataFromJson["boxes"]

  formatedQueue = []
  for item in queue:
    formatedQueue.append(formatPassword(item))
  
  formatedBoxes = []
  for item in boxes:
    formatedBoxes.append(formatPassword(item) if item != 0 else item)


  if(password in formatedQueue and not password in formatedBoxes):
    return jsonify({ 'message': "Ainda está na fila de espera" }), 400
  
  checkoutPassword(findedPassword["id"])
  boxes[formatedBoxes.index(password)] = 0

  data = {
    'boxes': boxes,
    'queue': queue
  }

  createJson(data=json.dumps(data))

  return jsonify(), 204

@app.route('/api/passwords/end', methods=["GET"]) 
def end():
  [boxes, queue] = returnBoxesAndQueue()

  isHavePasswordInBoxes = False
  for item in boxes:
    isHavePasswordInBoxes = True if item != 0 else isHavePasswordInBoxes

  if(isHavePasswordInBoxes):
    return jsonify({ 'message': "Ainda há pessoas sendo atendidas" }), 400

  if(len(queue) > 0):
    return jsonify({ 'message': "Ainda há pessoas para serem atendidas" }), 400
  

  return jsonify({ "link_planilha": "https://docs.google.com/spreadsheets/d/1kdCSm6NCydh3mfUBuYATwlRnl_hbxQYYEUoUkJ0xdT8/edit?usp=sharing" })
if __name__ == "__main__":
  app.run(debug=True)
