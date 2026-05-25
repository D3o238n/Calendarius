"""
Главный модуль приложения Flask.
"""
from flask import Flask, redirect, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    """ Отображение главной страницы приложения.
    """
    return render_template('index.html')


@app.route('/favicon.ico')
def favicon():
    """ Обработка запроса на favicon. Перенаправляет на внешний URL с иконкой."""
    return redirect('https://cdn-icons-png.flaticon.com/512/2693/2693507.png', code=302)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)