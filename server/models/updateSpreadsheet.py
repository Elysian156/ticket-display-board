import gspread
from db import connectDatabase
import os.path
import json
from datetime import datetime

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]

creds = None
if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            "models/credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

database = connectDatabase()
gc = gspread.authorize(creds)

current_date = datetime.now().date()
current_date_iso = current_date.isoformat()

# Path to the JSON file
database_file_path = '../database/spreadsheet_database.json'


def fetching_data():
    database_cursor = database.cursor()
    database_cursor.execute('SELECT * FROM users')

    users_list = database_cursor.fetchall()
    id_list = list()
    name_list = list()
    cpf_list = list()
    birthday_list = list()
    special_list = list()
    deficiency_list = list()
    for item in users_list:
        id_list.append(
            {
                item[0]
            }
        )
        name_list.append(
            {
                item[1]
            }
        )
        cpf_list.append(
            {
                item[2]
            }
        )
        birthday_list.append(
            {
                item[3].strftime('%d/%m/%Y')
            }
        )
        special_list.append(
            {
                item[4]
            }
        )
        deficiency_list.append(
            {
                item[5]
            }
        )
    return id_list, name_list, cpf_list, birthday_list, special_list, deficiency_list


def next_available_row(worksheet):
    str_list = list(filter(None, worksheet.col_values(1)))
    return str(len(str_list) + 1)


def updateSpreadsheet():
    """ Code that adds the information into the spreadsheet"""
    # Load existing data
    if os.path.exists(database_file_path):
        with open(database_file_path, 'r') as file:
            data = json.load(file)
    else:
        data = []

    # Find the spreadsheet_id for the current date
    spreadsheet_id = None
    for entry in data:
        if entry["created_date"] == current_date_iso:
            spreadsheet_id = entry["spreadsheet_id"]
            break

    worksheet = gc.open_by_key(spreadsheet_id).sheet1

    next_row = next_available_row(worksheet)

    worksheet.clear()
    worksheet.update_cell(1, 1, "CPF")
    worksheet.update_cell(1, 2, "Nome")
    worksheet.update_cell(1, 3, "Nascimento")
    worksheet.update_cell(1, 4, "Urgência")
    worksheet.update_cell(1, 5, "Deficiência")
    worksheet.update_cell(1, 6, "ID")
    next_row = next_available_row(worksheet)

    """Este código necessita que os valores de CPF estejam preenchidos
    de acordo, caso não estejam este código a planilha irá 'despedaçar'"""

    # Atualizando lista de id, valor de coluna 11

    [id_list, name_list, cpf_list, birthday_list, special_list, deficiency_list] = fetching_data()

    '''id_list = [1,2,3]
    deficiency_list = ["Visual", "Auditiva", "Nenhuma"]
    special_list = [1,2,0]
    birthday_list = ["10/12/1995","04/03/2005","07/06/1980"]
    name_list = ["Batata", "batatinha", "batatao"]
    cpf_list = ["12345678958","56789412390","45632187960"]'''

    for index, item in enumerate(id_list):
        worksheet.update_acell("F{}".format(next_row), *id_list[index])
        next_row = int(next_row) + 1

    next_row = next_available_row(worksheet)
    for index, item in enumerate(deficiency_list):
        worksheet.update_acell("E{}".format(next_row), *deficiency_list[index])
        next_row = int(next_row) + 1

    next_row = next_available_row(worksheet)
    for index, item in enumerate(special_list):
        worksheet.update_acell("D{}".format(next_row), *special_list[index])
        next_row = int(next_row) + 1

    next_row = next_available_row(worksheet)
    for index, item in enumerate(birthday_list):
        worksheet.update_acell("C{}".format(next_row), *birthday_list[index])
        next_row = int(next_row) + 1

    next_row = next_available_row(worksheet)
    for index, item in enumerate(name_list):
        worksheet.update_acell("B{}".format(next_row), *name_list[index])
        next_row = int(next_row) + 1

    next_row = next_available_row(worksheet)
    for index, item in enumerate(cpf_list):
        worksheet.update_acell("A{}".format(next_row), *cpf_list[index])
        next_row = int(next_row) + 1

    """database_cursor = database.cursor()
    database_cursor.execute("SELECT * from users")
    print(database_cursor.fetchall())
    sql = "DELETE FROM `users`"
    database_cursor.execute(sql)

    print(database_cursor.fetchall())
"""
    return print(f"docs.google.com/spreadsheets/d/" + spreadsheet_id + "/edit#gid=0")


if __name__ == "__main__":
    fetching_data()
    updateSpreadsheet()
