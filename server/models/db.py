import mysql.connector
import os

from dotenv import load_dotenv
load_dotenv()


def connectDatabase():
  return mysql.connector.connect(
    host=os.getenv('DATABASE_HOST'),
    user=os.getenv('DATABASE_USER'),
    port=os.getenv('DATABASE_PORT'),
    password=os.getenv('DATABASE_PASSWORD'),
    database=os.getenv('DATABASE')
  )