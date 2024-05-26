'''
  Identificar se o usuário é preferencial ou não: 
  N -> Normal
  P -> Preferencial

  Identificar nível de urgência:
  E -> Emergência
  U -> Urgência
  P -> Pouco urgente
  N -> Não urgente

  Identificar ordem de chamada:
  0000

  A senha final ficaria(exemplo):
  NN0001
  PE0001
  NN0002
'''

def generatePassword(isPriority, levelUrgency, callOrder):
  password = ("P" if isPriority else "N") + "."
  password += levelUrgency + "."
  password += str(callOrder).rjust(4, '0')

  splitedPassword = password.split(".")
  formatedPassword = splitedPassword[0] + splitedPassword[1] + splitedPassword[2]
  return { 'password': password, 'formatedPassword':  formatedPassword}

def formatPassword(unformatedPassword):
  splitedPassword = unformatedPassword.split('.')
  return splitedPassword[0] + splitedPassword[1] + splitedPassword[2]