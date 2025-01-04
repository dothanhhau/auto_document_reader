from flask import Blueprint, request, jsonify
from app.models.user_model import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

# Tạo Blueprint
auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
  data = request.get_json()
  email = data.get('email')
  password = data.get('password')
  
  if not email or not password:
    return jsonify({"success": False, "message": "Email và mật khẩu không được để trống"}), 400

  user = User.get_user_by_email(email)
  
  if not user or not check_password_hash(user['password'], password):
    return jsonify({"success": False, "message": "Sai email hoặc mật khẩu"}), 401
  
    # Kiểm tra trạng thái người dùng
  if user['status'] == "inactive":
    User.update_status(email, 'active')

  access_token = create_access_token(identity=str(user['_id']))
  
  return jsonify({
    "success": True,
    "message": "Đăng nhập thành công!",
    "token": access_token
  }), 200

@auth.route('/register', methods=['POST', 'OPTIONS'])
def register():
  if request.method == 'OPTIONS':
    return '', 200  # Phản hồi thành công cho yêu cầu OPTIONS
  
  data = request.get_json()
  email = data.get('email')
  password = data.get('password')

  if not email or not password:
    return jsonify({"success": False, "message": "Email và mật khẩu không được để trống"}), 400

  # Kiểm tra người dùng tồn tại
  user = User.get_user_by_email(email)
  if user:
    return jsonify({"success": False, "message": "Email đã được sử dụng"}), 409

  # Mã hóa mật khẩu trước khi lưu
  hashed_password = generate_password_hash(password)

  try:
    User.add_user(email, hashed_password)
    return jsonify({"success": True, "message": "Đăng ký thành công!"}), 201
  except Exception as e:
    return jsonify({'success': False, 'message': e})

