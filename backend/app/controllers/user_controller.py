from flask import Blueprint, jsonify
from app.models.user_model import User

# Tạo Blueprint
user = Blueprint('user', __name__)

@user.route('/<id>', methods=['GET'])
def getuserbyid(id):
  try:
    data = User.get_user_by_id(id)
    if not data:
      return jsonify({"message": "Data not found"}), 404

    data['_id'] = str(data['_id'])

    return jsonify(data)
  except Exception as e:
      return jsonify(e)

@user.route('/getalluser', methods=['GET'])
def getalluser():
  try:
    data = User.get_users()
    if not data:
      return jsonify({"message": "Data not found"}), 404

    data_list = []
    for a in data:
        a['_id'] = str(a['_id'])
        data_list.append(a)

    return jsonify(data_list)
  except Exception as e:
      return jsonify(e)
  