from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows frontend JS to call backend

# Configure MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'        # your MySQL username
app.config['MYSQL_PASSWORD'] = 'Sumanth@123'  # your MySQL password
app.config['MYSQL_DB'] = 'todo_db'

mysql = MySQL(app)

# Route: Serve frontend
@app.route('/')
def index():
    return render_template('index.html')  # move your HTML here

# Route: Get all tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, description, completed FROM tasks")
    data = cur.fetchall()
    cur.close()
    tasks = [{'id': row[0], 'text': row[1], 'isCompleted': bool(row[2])} for row in data]
    return jsonify(tasks)

# Route: Add a new task
@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.json
    task_text = data.get('text')
    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO tasks (description) VALUES (%s)", [task_text])
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Task added'}), 201

# Route: Delete a task
@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM tasks WHERE id = %s", [id])
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Task deleted'})

# Route: Mark task as complete/incomplete
@app.route('/tasks/<int:id>', methods=['PUT'])
def toggle_task(id):
    data = request.json
    completed = data.get('completed')
    cur = mysql.connection.cursor()
    cur.execute("UPDATE tasks SET completed = %s WHERE id = %s", [completed, id])
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Task updated'})

if __name__ == '__main__':
    app.run(debug=True)
