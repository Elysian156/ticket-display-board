def organizeQueue(passwords):
  def splitPassword(password):
    priorityLevel = password.split(".")[0]
    urgencyLevel = password.split(".")[1]
    callOrder = int(password.split(".")[2])

    return priorityLevel, urgencyLevel, callOrder
  
  urgency_order = {
    'E': 0,
    'U': 1,
    'P': 2,
    'N': 3 
  }

  def password_sort_key(password):
    priority, urgency, number = splitPassword(password)
    return (priority != 'P', urgency_order[urgency], number)
  
  reorderQueue = sorted(passwords, key=password_sort_key)

  priorityPasswords = []
  normalPasswords = []
  reordered = []

  for senha in reorderQueue:
    priorityPasswords.append(senha) if senha.split(".")[0] == "P" else normalPasswords.append(senha)

  lengthPreferential = len(priorityPasswords)
  lengthNormal = len(normalPasswords)

  indexP = 0 
  indexN = 0
  while indexP < lengthPreferential or indexN < lengthNormal:
    if indexP < lengthPreferential:
      reordered.append(priorityPasswords[indexP])
      indexP += 1
    if indexN < lengthNormal:
      reordered.append(normalPasswords[indexN])
      indexN += 1

  duplicados = set()
  fixedReordered = []
  for item in reordered:
    if item not in duplicados:
      fixedReordered.append(item)
      duplicados.add(item)

  return fixedReordered
