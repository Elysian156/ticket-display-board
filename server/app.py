from flask import Flask, request, jsonify
from flask_cors import CORS
import json

from models.fetchUsers import fetchUsers, getUserByCPF
from models.createNewUser import createUser
from models.passwords import (fetch_last_password, createPassword, fetchPasswords, fecthOnePasswordByCode, checkoutPassword, findPasswordWithPassword)
from models.updateSpreadsheet import fetching_data, updateSpreadsheet
from models.createSpreadsheet import createSpreadsheet

from utils.generate_password import generatePassword, formatPassword
from utils.reorder_queue_by_priority import organizeQueue
from utils.reorder_boxes import reorderBoxes

from lib.json import createJson, readJson, returnBoxesAndQueue

app = Flask(__name__)
CORS(app)

@app.route('/api/users', methods=["GET"])
def fetch_users():
    try:
        users = fetchUsers()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/users/add', methods=["POST"])
def create_user():
    try:
        userData = request.json
        name = userData.get("name")
        cpf = userData.get("cpf")
        date_birthday = userData.get("date_birthday")
        is_especial = userData.get("is_especial", False) 
        eligibility_reason = userData.get("eligibility_reason", "")

        if not all([name, cpf, date_birthday]):
            return jsonify({'message': 'Missing required fields'}), 400

        isCreatedUser = createUser(name, cpf, date_birthday, is_especial, eligibility_reason)

        if isCreatedUser:
            return jsonify({'message': 'Usuário cadastrado com sucesso!'}), 201
        else:
            return jsonify({'message': 'Não foi possível cadastrar o usuário'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/users/<cpf>', methods=["GET"])
def search_user(cpf):
    user = getUserByCPF(cpf)
    if user:
        user_id, name, cpf, date_birthday, is_especial, eligibility_reason = user
        return jsonify({
            'id': user_id,
            'name': name,
            'cpf': cpf,
            'date_birthday': date_birthday,
            'is_especial': is_especial,
            'eligibility_reason': eligibility_reason
        }), 200
    else:
        return jsonify({'message': "Usuário não encontrado"}), 404
@app.route('/api/passwords/create', methods=["POST"])
def create_password():
    try:
        passwordData = request.json
        userId = passwordData.get("user_id")
        isPriority = passwordData.get("is_priority", False)
        urgencyLevel = passwordData.get("urgency_level", "").upper()

        if not all([userId, urgencyLevel]):
            return jsonify({'message': 'Missing required fields'}), 400

        lastPassword = fetch_last_password(urgencyLevel, isPriority)
        order = lastPassword["order"] + 1 if lastPassword else 1

        password = generatePassword(callOrder=order, isPriority=isPriority, levelUrgency=urgencyLevel)
        unformatedPassword = password['password']
        last_inserted_id = createPassword(order, isPriority, urgencyLevel, userId, unformatedPassword)

        if last_inserted_id:
            lastPasswords = fetchPasswords()
            lastJson = readJson()
            oldQueue = [unformatedPassword]

            for item in lastPasswords:
                if not item["date_attended"] and item["unformatedPassword"] not in lastJson["boxes"]:
                    oldQueue.append(item["unformatedPassword"])

            reorderedQueue = organizeQueue(oldQueue)
            data = {
                'boxes': lastJson['boxes'],
                'queue': reorderedQueue
            }

            createJson(data=json.dumps(data))
            return jsonify({'id': last_inserted_id, 'password': password["formatedPassword"]}), 201

        return jsonify({'message': "Não foi possível cadastrar uma nova senha"}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/passwords/next', methods=['GET'])
def get_next_password():
    try:
        dataJson = readJson()
        queue = dataJson["queue"]
        boxes = dataJson["boxes"]

        if not queue:
            return jsonify({'message': "Não há ninguém na fila de espera"}), 200

        lotacao = sum(1 for box in boxes if box != 0)

        index, reception_number, fifo, boxes = reorderBoxes(data=dataJson, index=0)

        if lotacao == 5 or reception_number == -1:
            return jsonify({'message': "Aguarde liberação"}), 200 
        # eu mudei para 200 pq no frontend ele vai ignorar o request e mostrar a mensagem

        queue.pop(index)
        dataJson = {
            'boxes': boxes,
            'queue': queue
        }
        createJson(data=json.dumps(dataJson))

        appointment_number = "".join(fifo)
        name, eligibility_reason = findPasswordWithPassword(f"{fifo[0]}.{fifo[1]}.{fifo[2]}")

        response_data = {
            'appointment_number': appointment_number,
            'reception_number': reception_number,
            'name': name,
            'eligibility_reason': eligibility_reason, 
        }
        print(response_data)
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/passwords/checkout/<password>', methods=["PATCH"])
def password_checkout(password):
    try:
        findedPassword = fecthOnePasswordByCode(password)

        if not findedPassword:
            return jsonify({'message': "Senha não encontrada"}), 400

        if findedPassword["date_attended"]:
            return jsonify({'message': "Essa senha já foi atendida"}), 400

        dataFromJson = readJson()
        queue = dataFromJson["queue"]
        boxes = dataFromJson["boxes"]

        formatedQueue = [formatPassword(item) for item in queue]
        formatedBoxes = [formatPassword(item) if item != 0 else item for item in boxes]

        if password in formatedQueue and password not in formatedBoxes:
            return jsonify({'message': "Ainda está na fila de espera"}), 400

        checkoutPassword(findedPassword["id"])
        boxes[formatedBoxes.index(password)] = 0

        data = {
            'boxes': boxes,
            'queue': queue
        }

        createJson(data=json.dumps(data))

        return jsonify(), 204
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/passwords/end', methods=["GET"])
def end():
    try:
        boxes, queue = returnBoxesAndQueue()

        isHavePasswordInBoxes = any(box != 0 for box in boxes)

        if isHavePasswordInBoxes or queue:
            return jsonify({'message': "Ainda há pessoas para serem atendidas"}), 400

        createSpreadsheet()

        fetching_data()
        updateSpreadsheet()

        return jsonify({"link_planilha": "https://docs.google.com/spreadsheets/d/" + updateSpreadsheet() + "/edit?usp=sharing"}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/passwords/peek', methods=['GET'])
def peek_next_password():
    try:
        dataJson = readJson()
        queue = dataJson["queue"]
        boxes = dataJson["boxes"]

        if not queue:
            return jsonify({'message': "Não há ninguém na fila de espera"}), 200

        lotacao = sum(1 for box in boxes if box != 0)
        index, reception_number, fifo, _ = reorderBoxes(data=dataJson, index=0)

        if lotacao == 5 or reception_number == -1:
            return jsonify({'message': "Aguarde liberação"}), 400

        appointment_number = "".join(fifo)
        name, eligibility_reason = findPasswordWithPassword(f"{fifo[0]}.{fifo[1]}.{fifo[2]}")

        response_data = {
            'appointment_number': appointment_number,
            'reception_number': reception_number,
            'name': name,
            'eligibility_reason': eligibility_reason
        }

        print(response_data)
        return jsonify(response_data), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)