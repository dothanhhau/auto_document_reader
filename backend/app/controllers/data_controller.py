from flask import Blueprint, jsonify, request
from app.models.data_model import Data
from flask_jwt_extended import decode_token

# Tạo Blueprint
document = Blueprint('document', __name__)

@document.route('/getdata', methods=['GET'])
def getdata():
  try:
    token = str(request.headers.get('Authorization')).split(' ')[1]
    payload = decode_token(str(token))
    data = Data.get_data_by_user_id(payload['sub'])
    if not data:
      return jsonify({"message": "Data not found"}), 404

    data_list = []
    for a in data:
        a['_id'] = str(a['_id'])
        data_list.append(a)

    return jsonify(data_list)
  except Exception as e:
      return jsonify(e)
  

@document.route('/delete/<id>', methods=['POST'])
def deleteDocument(id):
  try:
    token = str(request.headers.get('Authorization')).split(' ')[1]
    payload = decode_token(str(token))

    if not payload:
      return jsonify({"message": "Token invalid"}), 404
      
    data = Data.check_data(id, payload['sub'])

    if not data:
      return jsonify({"message": "Data not found"}), 404

    Data.delete_data_by_id(id)

    return jsonify(status=200, data="Delete success")
  except Exception as e:
    return jsonify(e)
     
