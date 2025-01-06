from datetime import datetime
from app._init_ import mongo
from bson import ObjectId

class Data:
    @staticmethod
    def get_all_data():
      return mongo.db.data.find() # type: ignore

    @staticmethod
    def get_data_by_user_id(user_id):
      return mongo.db.data.find({'user_id': user_id}) # type: ignore
    
    @staticmethod
    def get_data_by_id(id):
      return mongo.db.data.find_one({'_id': ObjectId(id)}) # type: ignore

    @staticmethod
    def add_data(user_id, text, audio, voice):
      return mongo.db.data.insert_one({ # type: ignore
                                      "user_id": user_id, 
                                      "text": text, 
                                      "audio": audio,
                                      "voice": voice,
                                      "created_at": datetime.now()
                                    })
    
    @staticmethod
    def check_data(id, user_id):
      return mongo.db.data.find_one({'_id': ObjectId(id), 'user_id': user_id}) # type: ignore
    
    @staticmethod
    def delete_data_by_id(id):
      return mongo.db.data.delete_one({'_id': ObjectId(id)}) # type: ignore

    @staticmethod
    def update_position_by_id(id, pos):
      return mongo.db.data.update_one({'_id': ObjectId(id)}, {"$set": {"position": pos}}, upsert=True) # type: ignore
    
    
        
