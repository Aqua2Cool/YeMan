from flask import Flask, send_from_directory, request, jsonify
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('views.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS views
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  ip TEXT,
                  timestamp TEXT,
                  user_agent TEXT)''')
    conn.commit()
    conn.close()

# Get total views count
def get_views_count():
    conn = sqlite3.connect('views.db')
    c = conn.cursor()
    c.execute('SELECT COUNT(DISTINCT ip) FROM views')
    count = c.fetchone()[0]
    conn.close()
    return count

# Log a new view
def log_view(ip, user_agent):
    conn = sqlite3.connect('views.db')
    c = conn.cursor()
    timestamp = datetime.now().isoformat()
    c.execute('INSERT INTO views (ip, timestamp, user_agent) VALUES (?, ?, ?)',
              (ip, timestamp, user_agent))
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Serve static files
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# API endpoint for views
@app.route('/api/views', methods=['GET', 'POST'])
def handle_views():
    if request.method == 'POST':
        ip = request.remote_addr
        user_agent = request.headers.get('User-Agent')
        log_view(ip, user_agent)
        
    return jsonify({'views': get_views_count()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 