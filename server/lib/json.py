import json

def createJson(data):
  with open('queue.json', 'w') as file:
    file.write(data)

def readJson():
  file = open("queue.json", encoding="utf-8")
  data = json.load(file)
  file.close()

  return data

def returnBoxesAndQueue():
  dataJson = readJson()
  boxes = dataJson["boxes"]
  queue = dataJson["queue"]

  return [boxes, queue]