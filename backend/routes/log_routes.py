# # routes/log_routes.py
# from flask import Blueprint, request, jsonify
# from services.detection import detect_attack
# from models.database import get_db
# from datetime import datetime

# log_bp = Blueprint("logs", __name__)

# @log_bp.route("/", methods=["POST"], strict_slashes=False)
# def receive_log():
#     data = request.json
#     db = get_db()
    
#     # Detection logic
#     status = detect_attack(data)
#     data["status"] = status
#     data["timestamp"] = datetime.utcnow().isoformat()

#     # Save in logs collection
#     db.logs.insert_one(data)

#     # If suspicious, save in alerts collection
#     if status != "safe":
#         alert = {
#             "ip": data.get("ip"),
#             "reason": status,
#             "time": data["timestamp"]
#         }
#         db.alerts.insert_one(alert)

#     return jsonify({"message": "Log received", "result": status}), 201


# @log_bp.route("/", methods=["GET"], strict_slashes=False)
# def get_logs():
#     db = get_db()
#     logs = list(db.logs.find({}, {"_id": 0}))
#     return jsonify(logs)


from flask import Blueprint, request, jsonify
from services.detection import detect_attack
from models.database import get_db
from datetime import datetime, timezone

log_bp = Blueprint("logs", __name__)

@log_bp.route("/", methods=["POST"], strict_slashes=False)
def receive_log():
    # force JSON parsing and default to {} if nothing
    data = request.get_json(force=True) or {}
    db = get_db()

    # Detection logic (ensure detect_attack handles missing fields gracefully)
    try:
        status = detect_attack(data)
    except Exception as e:
        # If detection fails, log and mark as 'error' so it doesn't crash the endpoint
        status = f"error:{str(e)}"

    data["status"] = status
    # Use timezone-aware UTC timestamp to avoid DeprecationWarning
    data["timestamp"] = datetime.now(timezone.utc).isoformat()

    # Save in logs collection (assuming db and collections exist)
    db.logs.insert_one(data)

    # If suspicious, save in alerts collection
    if status != "safe":
        alert = {
            "ip": data.get("ip"),
            "reason": status,
            "time": data["timestamp"]
        }
        db.alerts.insert_one(alert)

    return jsonify({"message": "Log received", "result": status}), 201


@log_bp.route("/", methods=["GET"], strict_slashes=False)
def get_logs():
    db = get_db()
    logs = list(db.logs.find({}, {"_id": 0}))
    return jsonify(logs)
