from flask import Blueprint, request, jsonify
import requests
from flask_jwt_extended import decode_token
import json
import os
from dotenv import load_dotenv
from app.models.data_model import Data
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=str(os.getenv('GOOGLE_API_KEY')))
model = genai.GenerativeModel(str(os.getenv('MODLE_GEMINI')))

# Tạo Blueprint
googleapi = Blueprint('googleapi', __name__)

@googleapi.route('/texttospeech', methods=['POST'])
def texttospeech():
  try:
    url = str(os.getenv('URL_TTS'))

    data = {
      "text": request.form.get('text'),
      "lang": request.form.get('lang'),
      "gender": request.form.get('gender')
    }

    if data['gender'] == "MALE":
      name = os.getenv('VOICE_NAME_MALE')
    else:
      name = os.getenv('VOICE_NAME_FEMALE')

    name = f'{data['lang']}-{name}'
    
    payl = {
      "input": {"text": data['text']},
      "voice": {
        "languageCode": data['lang'],
        "ssmlGender": data['gender'],
        "name": name
      },
      "audioConfig": {
        "audioEncoding": "MP3"
      }
    }

    headers = {
      "Content-Type": "application/json",
    }

    params = {
      "key": str(os.getenv('GOOGLE_API_KEY'))
    }

    token = str(request.headers.get('Authorization')).split(' ')[1]
    payload = decode_token(str(token))

    try:
      response = requests.post(url, headers=headers, params=params, data=json.dumps(payl))

      if response.status_code == 200:
        audio_content = response.json()['audioContent']

        result = Data.add_data(payload['sub'], data['text'], str(audio_content), data['gender'], data['lang'])
        return jsonify(status=200, data=str(audio_content), id=str(result.inserted_id))
      else:
        return jsonify(status=response.status_code, data=response.text)
    except Exception as e:
      return jsonify(status=500, data=e)
    
  except Exception as e:
    print(e)
    return jsonify({"error": str(e)}), 500

@googleapi.route('/translate', methods=['POST'])
def translate():
  url = str(os.getenv('URL_TRANSLATE'))
  payload = {
    'q': request.form.get('text'),
    'target': request.form.get('lang'),
    'key': str(os.getenv('GOOGLE_API_KEY'))
  }
  
  try:
    response = requests.post(url, data=payload)
    
    if response.status_code == 200:
      result = response.json()
      return jsonify(status=200, data=result['data']['translations'][0]['translatedText'])
    else:
      return jsonify(status=response.status_code, data=response.text)
  except Exception as e:
    return jsonify(status=500, data=e)

@googleapi.route('/summary', methods=['POST'])
def summary():
  prompt = request.form.get('prompt')
  if not prompt:
    prompt = "Tóm tắt đoạn văn dưới đây cho tôi. Tuỳ thuộc vào ngôn ngữ của đoạn text bên dưới. Nếu tiếng việt thì trả về tiếng việt, tiếng anh thì trả về tiếng anh, ..."
  data = {
    "text": request.form.get('text'),
    "prompt": prompt
  }
  try:
    response = model.generate_content(str(data['prompt'] + '\n' + data['text']))
    return jsonify(status=200, data=response.text)
  except Exception as e:
    return jsonify(status=500, data=e)
  
@googleapi.route('/call_gemini', methods=['POST'])
def call_gemini():
  prompt = request.form.get('prompt')
  if not prompt:
    prompt = ''
  data = {
    "text": request.form.get('text'),
    "prompt": prompt
  }
  try:
    response = model.generate_content(str(data['prompt'] + '\n' + data['text']))
    return jsonify(status=200, data=response.text)
  except Exception as e:
    return jsonify(status=500, data=e)

