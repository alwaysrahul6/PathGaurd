
from flask import Blueprint, jsonify
from models.database import get_db

alert_bp = Blueprint("alerts", __name__)

@alert_bp.route("/", methods=["GET"])
def get_alerts():
    db = get_db()
    alerts = list(db.alerts.find({}, {"_id": 0}))  # Hide MongoDB internal _id
    return jsonify(alerts)
