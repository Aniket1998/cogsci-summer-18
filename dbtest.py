import sqlite3
conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()
for row in c.execute('SELECT * FROM Experiment'):
    print(row)
