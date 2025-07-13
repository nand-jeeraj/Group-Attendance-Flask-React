
# app.py (Flask backend with upload and add-face working)

import os, json, face_recognition, numpy as np
from datetime import datetime
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_login import LoginManager, login_user, login_required, logout_user, current_user, UserMixin
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
import traceback

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "super-secret-key")
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/attendance_db")

mongo = PyMongo(app)
login_manager = LoginManager(app)
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.before_request
def log_every_request():
    print(f"📥 {request.method} {request.path}")

class DummyUser(UserMixin):
    def __init__(self, user_id):
        self.id = str(user_id)

@login_manager.user_loader
def load_user(user_id):
    return DummyUser(user_id)

@app.route("/api/check-auth")
def check_auth():
    if current_user.is_authenticated:
        return jsonify({"status": "ok"})
    return jsonify({"status": "unauthorized"}), 401

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.json
    username = data["username"]
    password = generate_password_hash(data["password"])
    if mongo.db.faculty.find_one({"username": username}):
        return jsonify({"success": False, "message": "Username exists"}), 400
    mongo.db.faculty.insert_one({"username": username, "password": password})
    return jsonify({"success": True})

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.json
    username, password = data["username"], data["password"]
    user = mongo.db.faculty.find_one({"username": username})
    if user and check_password_hash(user["password"], password):
        login_user(DummyUser(user["_id"]))
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid"}), 401

@app.route("/api/logout", methods=["POST"])
@login_required
def api_logout():
    logout_user()
    return jsonify({"success": True})

def save_known_face_to_db(name, image_path):
    try:
        img_pil = Image.open(image_path).convert("RGB")
        img_pil.save(image_path)
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            return False
        encoding_str = json.dumps(encodings[0].tolist())
        mongo.db.known_faces.update_one({"name": name}, {"$set": {"encoding": encoding_str}}, upsert=True)
        return True
    except Exception as e:
        traceback.print_exc()
        return False

def load_known_faces():
    encs, names = [], []
    for face in mongo.db.known_faces.find():
        encs.append(np.array(json.loads(face["encoding"])))
        names.append(face["name"])
    return encs, names

def recognize_faces(image_path):
    known_enc, known_names = load_known_faces()
    img = face_recognition.load_image_file(image_path)
    face_locations = face_recognition.face_locations(img)
    face_encs = face_recognition.face_encodings(img, face_locations)
    present, unknown = set(), 0
    for enc in face_encs:
        if not known_enc:
            unknown += 1
            continue
        dist = face_recognition.face_distance(known_enc, enc)
        best = np.argmin(dist)
        if dist[best] < 0.45:
            present.add(known_names[best])
        else:
            unknown += 1
    return list(present), unknown, len(face_encs)

@app.route("/api/upload", methods=["POST"])
@login_required
def api_upload():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400
        file = request.files["image"]
        filename = secure_filename(file.filename)
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        Image.open(path).convert("RGB").save(path)
        present, unknown, total = recognize_faces(path)
        for name in present:
            mongo.db.students.update_one({"name": name}, {"$setOnInsert": {"name": name}}, upsert=True)
            mongo.db.attendance.insert_one({"student_name": name, "timestamp": datetime.utcnow()})
        return jsonify({"present": present, "unknown": unknown, "total": total})
    except Exception as e:
        print(e)
        traceback.print_exc()
        return jsonify({"error": "Upload failed"}), 500

@app.route("/api/known-face", methods=["POST"])
@login_required
def api_known_face():
    try:
        if 'image' not in request.files or 'name' not in request.form:
            return jsonify({"error": "Missing name or image"}), 400
        name = request.form["name"]
        file = request.files["image"]
        filename = secure_filename(file.filename)
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        Image.open(path).convert("RGB").save(path)
        success = save_known_face_to_db(name, path)
        if not success:
            return jsonify({"error": "No face found"}), 400
        return jsonify({"success": True})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Failed to add face"}), 500

@app.route("/api/history", methods=["GET"])
@login_required
def api_history():
    recs = list(mongo.db.attendance.find().sort("timestamp", -1))
    for r in recs:
        r["_id"] = str(r["_id"])
        r["timestamp"] = r["timestamp"].isoformat()
    return jsonify(recs)

@app.route("/api/dashboard", methods=["GET"])
@login_required
def api_dashboard():
    pipeline = [{"$group": {"_id": "$student_name", "count": {"$sum": 1}}}]
    data = list(mongo.db.attendance.aggregate(pipeline))
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
