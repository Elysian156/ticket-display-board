import gspread
from db import connectDatabase
import os.path
import json
from datetime import datetime
from pathlib import Path

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
            "credentials.json", SCOPES)
        creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

gc = gspread.authorize(creds)

def createSpreadsheet():
    current_date = datetime.now().date()
    data = current_date.strftime('%d-%m-%Y')

    spreadsheet = gc.create("Relatório " + data, '1jvdbx2TUWA-C9zNi5RoqYWmiW1C0mqP1')
    spreadsheet_id = spreadsheet.id

    # Load existing data
    database_file = Path('../database/spreadsheet_database.json')
    if os.path.exists(database_file):
        with open(database_file, 'r') as file:
            database = json.load(file)
    else:
        database = []

    # Add new spreadsheet entry
    database.append({
        "spreadsheet_id": spreadsheet_id,
        "created_date": current_date.isoformat()
    })

    # Sort database by created_date
    database.sort(key=lambda x: x["created_date"])

    # Save sorted database back to the file
    with open(database_file, 'w') as file:
        json.dump(database, file, indent=4)

    print(f"New spreadsheet created with ID: {spreadsheet_id}")

if __name__ == "__main__":
    createSpreadsheet()
