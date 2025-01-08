from flask import Blueprint, request, jsonify
from app.models.user_model import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, decode_token
from datetime import datetime, timedelta

# Tạo Blueprint
auth = Blueprint('auth', __name__)

@auth.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
  try:
    token = str(request.headers.get('Authorization')).split(' ')[1]
    user_id = decode_token(token)['sub']
    user = User.get_user_by_id(user_id)

    if not user: return 'User not existed', 404

    return jsonify(data=user['email']), 200
  except Exception as e:
    return jsonify(data=e), 401

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
  # else:
  #   return jsonify(sucess=False, message='Tài khoản đang đang nhập ở nơi khác'), 403

  access_token = create_access_token(identity=str(user['_id']))
  
  return jsonify({
    "success": True,
    "message": "Đăng nhập thành công!",
    "token": access_token
  }), 200

@auth.route('/logout', methods=['POST'])
def logout():
  data = request.get_json()
  email = data.get('email')
  
  if not email:
    return jsonify({"success": False, "message": "Email không được để trống"}), 400

  user = User.get_user_by_email(email)

  if not user: return jsonify(sucess=False, message='User not existed'), 404

  User.update_status(email, 'inactive')
  
  return jsonify({
    "success": True,
    "message": "Đăng xuất thành công!"
  }), 200

@auth.route('/register', methods=['POST'])
def register():
  data = request.get_json()
  email = data.get('email')
  password = data.get('password')
  otp = data.get('otp')

  if not email or not password:
    return jsonify({"success": False, "message": "Email và mật khẩu không được để trống"}), 400

  # Kiểm tra người dùng tồn tại
  user = User.get_user_by_email(email)
  if not user or user['password'] != '': # type: ignore
    return jsonify({"success": False, "message": "Email đã được sử dụng"}), 409
  else:
    check_otp = User.get_user_by_email(email)
    if otp != check_otp.get('otp'): # type: ignore
      return jsonify({"success": False, "message": "OTP không chính xác"}), 409
    
    if datetime.now() > (check_otp['created_at'] + timedelta(minutes=10)): # type: ignore
      return jsonify({"success": False, "message": "OTP đã quá hạn"}), 409
    
  hashed_password = generate_password_hash(password)

  try:
    User.update_pass(email, hashed_password)
    return jsonify({"success": True, "message": "Đăng ký thành công!"}), 200
  except Exception as e:
    return jsonify({'success': False, 'message': e})


  # Mã hóa mật khẩu trước khi lưu

