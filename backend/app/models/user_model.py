from datetime import datetime
from app._init_ import mongo

class User:
    @staticmethod
    def get_users():
        return mongo.db.users.find() # type: ignore

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
        
