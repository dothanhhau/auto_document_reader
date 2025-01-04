from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app)

# Configure MongoDB
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

# Register Blueprints
from app.controllers.auth_controller import auth
from app.controllers.googleapi_controller import googleapi
from app.controllers.data_controller import document

app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(googleapi, url_prefix='/api/googleapi')
app.register_blueprint(document, url_prefix='/api/document')
