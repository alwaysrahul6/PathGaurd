# from flask import Flask
# from flask_cors import CORS
# from routes.log_routes import log_bp
# from routes.alert_routes import alert_bp
# from models.database import init_db

# app = Flask(__name__)
# CORS(app)  # frontend ko connect karne ke liye

# # MongoDB connect
# init_db()

# # Register Blueprints (modular routes)
# app.register_blueprint(log_bp, url_prefix="/api/logs")
# app.register_blueprint(alert_bp, url_prefix="/api/alerts")

# if __name__ == "__main__":
#     print(app.url_map)   # 👈 ye line daalo
#     app.run(debug=True, host='localhost', port=5000)



from flask import Flask
from flask_cors import CORS
from routes.log_routes import log_bp
from routes.alert_routes import alert_bp
from models.database import init_db

app = Flask(__name__)
CORS(app)  # frontend ko connect karne ke liye

# MongoDB connect
init_db()

# Register Blueprints (modular routes)
app.register_blueprint(log_bp, url_prefix="/api/logs")
app.register_blueprint(alert_bp, url_prefix="/api/alerts")

if __name__ == "__main__":
    # Print url map so you can verify registered routes on startup
    print(app.url_map)
    app.run(debug=True, host='localhost', port=8000)
