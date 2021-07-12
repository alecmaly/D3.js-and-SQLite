import sqlite3
from sqlite3 import Error
import json


def create_connection(db_file):
  """ create a database connection to a SQLite database """
  try:
    conn = sqlite3.connect(db_file)
    print(sqlite3.version)
  except Error as e:
    print(e)
  finally:
    c = conn.cursor()
    
    # open data file
    with open('data.json') as f:
      data = json.load(f)

    # create tables (delete old tables)
    for table in data:
      c.execute("DROP TABLE IF EXISTS " + table)
      qryString = "CREATE TABLE " + table + "("
      for column in data[table][0]:
        qryString = qryString + column + " text,"
      qryString = qryString[:-1] + ")"
      c.execute(qryString)

    # create records
    for table in data:      
      for row in data[table]:
        qryString = "INSERT INTO " + table + " VALUES ('"
        for column_data in row:
          qryString = qryString + row[column_data] + "','"
        qryString = qryString[:-2] + ")"
        c.execute(qryString) 
    #c.execute('''DROP TABLE stocks''')
    #c.execute('''CREATE TABLE stocks (date text)''')
    #c.execute("INSERT INTO stocks VALUES ('2005-01-05')")

    conn.commit()
    conn.close()




if __name__ == '__main__':
  create_connection("pythonsqllite.db")

input('done')