import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import Blueprint, request, jsonify
from app.models.user_model import User
import random
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

load_dotenv()
send_mail = Blueprint('send_mail', __name__)

# Cấu hình thông tin email
sender_email = str(os.getenv('SENDER_MAIL'))
password = str(os.getenv('PASSWORD_GOOGLE'))  # Hoặc "App Password" nếu có bật xác thực hai yếu tố
# # Cấu hình đối tượng email

# Đọc nội dung email từ file HTML
with open("./app/views/template_send_otp.html", "r", encoding="utf-8") as file:
    html_content = file.read()

@send_mail.route('/register', methods=['POST'])
def send_mail_register():
    verification_code = str(random.randint(100000, 999999))
    html_send = html_content.replace("{{verification_code}}", verification_code)
    data = request.get_json()
    receiver_email = data.get('email')

    if not receiver_email:
        return jsonify({"success": False, "message": "Email không được để trống"}), 400
    else:
        user = User.get_user_by_email(receiver_email)
        if not user:
            User.add_email(receiver_email, verification_code)
        elif user.get('password'):
            return jsonify({"success": False, "message": "Email đã được đăng ký"}), 403
        else:
            User.update_otp(receiver_email, verification_code)

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email  
    msg['Subject'] = "Xác thực email của bạn"
    # Gửi email dưới dạng HTML
    msg.attach(MIMEText(html_send, 'html'))

    # # Kết nối tới server Gmail và gửi email
    try:
        # Cấu hình kết nối tới server Gmail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Bắt đầu mã hóa TLS để bảo mật

        # Đăng nhập vào tài khoản Gmail
        server.login(sender_email, password)

        # Gửi email
        server.sendmail(sender_email, receiver_email, msg.as_string())

        return jsonify({"success": True, "message": "Đã gửi mã OTP thành công"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": e}), 500
    finally:
        # Đóng kết nối SMTP
        server.quit() # type: ignore

@send_mail.route('/fogot_password', methods=['POST'])
def send_mail_fogot_password():
    verification_code = str(random.randint(100000, 999999))
    html_send = html_content.replace("{{verification_code}}", verification_code)
    data = request.get_json()
    receiver_email = data.get('email')

    if not receiver_email:
        return jsonify({"success": False, "message": "Email không được để trống"}), 400
    else:
        user = User.get_user_by_email(receiver_email)
        if not user:
            return jsonify({"success": False, "message": "Email không tồn tại"}), 403
        else:
            User.update_otp(receiver_email, verification_code)

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email  
    msg['Subject'] = "Xác thực email của bạn"
    # Gửi email dưới dạng HTML
    msg.attach(MIMEText(html_send, 'html'))

    # # Kết nối tới server Gmail và gửi email
    try:
        # Cấu hình kết nối tới server Gmail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Bắt đầu mã hóa TLS để bảo mật

        # Đăng nhập vào tài khoản Gmail
        server.login(sender_email, password)

        # Gửi email
        server.sendmail(sender_email, receiver_email, msg.as_string())

        print("Email đã được gửi thành công!")
        return ''
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")
        return ''
    finally:
        # Đóng kết nối SMTP
        server.quit() # type: ignore

@send_mail.route('/verify_fogot_password', methods=['POST'])
def verify_fogot_password():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Email và mật khẩu không được để trống"}), 400

    # Kiểm tra người dùng tồn tại
    user = User.get_user_by_email(email)
    if not user: # type: ignore
        return jsonify({"success": False, "message": "Email không tồn tại"}), 409
    else:
        check_otp = User.get_user_by_email(email)
        if otp != check_otp.get('otp'): # type: ignore
            return jsonify({"success": False, "message": "OTP không chính xác"}), 409
        
        if datetime.now() > (check_otp['created_at'] + timedelta(minutes=10)): # type: ignore
            return jsonify({"success": False, "message": "OTP đã quá hạn"}), 409
        
    hashed_password = generate_password_hash(password)

    try:
        User.update_pass(email, hashed_password)
        return jsonify({"success": True, "message": "Đổi mật khẩu thành công!"}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': e})





