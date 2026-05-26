import os
import json
import uuid
import logging
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("database")
logging.basicConfig(level=logging.INFO)

# High-Fidelity Mock Collection to emulate MongoDB PyMongo interface when MongoDB is offline
class MockCollection:
    def __init__(self, db_file, collection_name):
        self.db_file = db_file
        self.name = collection_name

    def _load_db(self):
        if not os.path.exists(self.db_file):
            return {}
        try:
            with open(self.db_file, "r") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save_db(self, db_data):
        try:
            with open(self.db_file, "w") as f:
                json.dump(db_data, f, default=str, indent=2)
        except Exception as e:
            logger.error(f"Error saving mock database: {e}")

    def insert_one(self, document):
        db_data = self._load_db()
        if self.name not in db_data:
            db_data[self.name] = []

        doc = dict(document)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        elif isinstance(doc["_id"], ObjectId):
            doc["_id"] = str(doc["_id"])

        db_data[self.name].append(doc)
        self._save_db(db_data)
        
        # Emulate InsertOneResult
        class InsertResult:
            inserted_id = doc["_id"]
        return InsertResult()

    def find_one(self, query):
        db_data = self._load_db()
        items = db_data.get(self.name, [])
        for item in items:
            if self._matches(item, query):
                return item
        return None

    def find(self, query=None):
        if query is None:
            query = {}
        db_data = self._load_db()
        items = db_data.get(self.name, [])
        matched = []
        for item in items:
            if self._matches(item, query):
                matched.append(item)

        # Mock Cursor supporting sort and limit
        class MockCursor:
            def __init__(self, data):
                self.data = data

            def __iter__(self):
                return iter(self.data)

            def sort(self, key, direction=-1):
                # Simple sort by datetime or string keys
                try:
                    self.data.sort(key=lambda x: x.get(key, ""), reverse=(direction == -1))
                except Exception:
                    pass
                return self

            def limit(self, count):
                self.data = self.data[:count]
                return self

            def to_list(self, length=None):
                return self.data[:length] if length else self.data

        return MockCursor(matched)

    def update_one(self, query, update_dict):
        db_data = self._load_db()
        items = db_data.get(self.name, [])
        modified_count = 0
        
        for item in items:
            if self._matches(item, query):
                # Handle standard MongoDB '$set' operator
                if "$set" in update_dict:
                    for k, v in update_dict["$set"].items():
                        if isinstance(v, datetime):
                            item[k] = v.isoformat()
                        else:
                            item[k] = v
                else:
                    for k, v in update_dict.items():
                        item[k] = v
                modified_count = 1
                break
                
        if modified_count > 0:
            self._save_db(db_data)

        class UpdateResult:
            matched_count = modified_count
            modified_count = modified_count
        return UpdateResult()

    def delete_one(self, query):
        db_data = self._load_db()
        items = db_data.get(self.name, [])
        initial_len = len(items)
        
        db_data[self.name] = [item for item in items if not self._matches(item, query)]
        deleted_count = initial_len - len(db_data[self.name])
        
        if deleted_count > 0:
            self._save_db(db_data)

        class DeleteResult:
            deleted_count = deleted_count
        return DeleteResult()

    def count_documents(self, query):
        db_data = self._load_db()
        items = db_data.get(self.name, [])
        count = sum(1 for item in items if self._matches(item, query))
        return count

    def _matches(self, item, query):
        for k, v in query.items():
            # Support basic ID queries
            if k == "_id" and isinstance(v, ObjectId):
                v = str(v)
            if k == "_id" and isinstance(item.get("_id"), str) and str(item.get("_id")) == str(v):
                continue
                
            # Handle nested query matching (e.g. {"$or": [...]})
            if k == "$or":
                sub_matches = [self._matches(item, q) for q in v]
                if not any(sub_matches):
                    return False
                continue

            # Standard equality match
            val = item.get(k)
            if isinstance(val, ObjectId):
                val = str(val)
            if isinstance(v, dict) and "$in" in v:
                if val not in v["$in"]:
                    return False
            elif str(val) != str(v):
                return False
        return True


class MockDatabase:
    def __init__(self, db_file):
        self.db_file = db_file

    def __getitem__(self, collection_name):
        return MockCollection(self.db_file, collection_name)


# Initialize DB Connection
db = None
is_mock_db = False

# Try connecting to actual MongoDB
try:
    if settings.MONGODB_URI:
        logger.info(f"Connecting to MongoDB at: {settings.MONGODB_URI.split('@')[-1]}")
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Verify if connection is healthy
        client.server_info()
        db = client[settings.DB_NAME]
        logger.info("Successfully connected to real MongoDB instance.")
        # Ensure collection indexes are present for high-performance RAG and document listing
        try:
            db["embeddings"].create_index("pdf_id")
            db["pdfs"].create_index("user_id")
            logger.info("Verified database indexes for RAG querying and PDF tracking.")
        except Exception as idx_err:
            logger.warning(f"Failed to create database indexes: {idx_err}")
except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
    logger.warning(f"Could not connect to MongoDB client: {e}. Activating High-Fidelity local mock database.")

if db is None:
    # Use JSON DB Store in backend folder
    db_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db_store.json")
    db = MockDatabase(db_file_path)
    is_mock_db = True
    logger.info(f"High-fidelity JSON DB activated at: {db_file_path}")

def get_collection(name: str):
    col = db[name]
    if not is_mock_db:
        from bson.objectid import ObjectId
        class CollectionWrapper:
            def __init__(self, collection):
                self.collection = collection
                
            def _convert_query(self, query):
                if query and "_id" in query and isinstance(query["_id"], str):
                    try:
                        query["_id"] = ObjectId(query["_id"])
                    except Exception:
                        pass
                return query
                
            def find_one(self, query):
                return self.collection.find_one(self._convert_query(query))
                
            def find(self, query=None):
                return self.collection.find(self._convert_query(query) if query else None)
                
            def insert_one(self, document):
                return self.collection.insert_one(document)
                
            def update_one(self, query, update_dict):
                return self.collection.update_one(self._convert_query(query), update_dict)
                
            def delete_one(self, query):
                return self.collection.delete_one(self._convert_query(query))

            def count_documents(self, query):
                return self.collection.count_documents(self._convert_query(query))
                
        return CollectionWrapper(col)
    return col
