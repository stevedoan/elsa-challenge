import threading
import typing

from pymongo import MongoClient
from pymongo.server_api import ServerApi

from quiz import constants


class Singleton(type):
    _instances: typing.Dict = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        # with cls._lock:
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class MongoManager(metaclass=Singleton):
    def __init__(self):
        client_db_url = constants.DB_URL
        self.client = MongoClient(
            client_db_url,
            server_api=ServerApi("1", strict=False, deprecation_errors=True),
        )


# Connect to MongoDB
client = MongoManager().client
