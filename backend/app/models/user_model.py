from datetime import datetime
from app._init_ import mongo
from bson import ObjectId

class User:
    @staticmethod
    def get_users():
        return mongo.db.users.find() # type: ignore

    @staticmethod
    def get_user_by_id(id):
        return mongo.db.users.find_one({'_id': ObjectId(id)}) # type: ignore

    @staticmethod
    def get_user_by_email(email):
        return mongo.db.users.find_one({'email': email}) # type: ignore

    @staticmethod
    def check_login(email, password):
        return mongo.db.users.find_one({'email': email}) # type: ignore
    
    @staticmethod
    def update_status(email, status):
        return mongo.db.users.update_one({"email": email}, {"$set": {"status": status}}) # type: ignore

    @staticmethod
    def add_user(email, hashpass):
        return mongo.db.users.insert_one({ # type: ignore
                                        "email": email, 
                                        "password": hashpass, 
                                        "created_at": datetime.utcnow(),
                                        "status": "inactive"
                                    })
    
    @staticmethod
    def add_email(email, otp):
        return mongo.db.users.insert_one({ # type: ignore
                                        "email": email, 
                                        "password": '',
                                        "otp": otp, 
                                        "created_at": datetime.utcnow(),
                                        "status": "inactive"
                                    })
    
    @staticmethod
    def update_pass(email, password):
        return mongo.db.users.update_one({"email": email}, {"$set": {"password": password}}) # type: ignore
