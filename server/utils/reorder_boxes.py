def reorderBoxes(data, index):
  queue = data["queue"]
  boxes = data["boxes"]
  if(index < len(queue)):
    proximoDaFila = queue[index]
    fifo = proximoDaFila.split('.')
    reception_number = 1
    if(fifo[0] == 'P'):
      if(boxes[0] == 0):
        boxes[0] = proximoDaFila
      elif(boxes[0] != 0 and boxes[1] == 0):
        boxes[1] = proximoDaFila
        reception_number = 2
      elif(boxes[0] != 0 and boxes[1] != 0):
        return reorderBoxes(data=data, index=index+1)

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
        return reorderBoxes(data=data, index=index+1)    
    return index, reception_number, fifo, boxes
  else:
    reception_number = -1
    fifo = ""
    return index, reception_number, fifo, boxes