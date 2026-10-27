import sqlite3
conn = sqlite3.connect('.local/share/opencode/state.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()
print('Tables:', tables)
for table in tables:
    cursor.execute(f'SELECT * FROM {table[0]} LIMIT 10')
    rows = cursor.fetchall()
    print(f'\n{table[0]}:')
    for row in rows:
        print(row)
conn.close()