"""
Main application module for Planor PWA.
"""
from flask import Flask, redirect, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    """
    Render the main page of the application.
    
    Returns:
        str: Rendered HTML template.
    """
    return render_template('index.html')


@app.route('/favicon.ico')
def favicon():
    """Redirect favicon requests to the app icon to avoid 404s."""
    return redirect('https://cdn-icons-png.flaticon.com/512/2693/2693507.png', code=302)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)