import mysql.connector as conn
import mysql.connector.pooling as pooling
from dotenv import load_dotenv
import os

load_dotenv()
DB_USERNAME = os.environ.get("DB_USERNAME","1234")
DB_PASSWORD = os.environ.get("DB_PASSWORD","1234")
JWT_SECRET=os.environ.get("JWT_SECRET","secret")

dbconfig = {
  "host":"localhost",
  "database": "website",
  "user":DB_USERNAME,
  "password":DB_PASSWORD,
}

cnxpool = pooling.MySQLConnectionPool(pool_name = "mypool",pool_size = 20,**dbconfig)

from .attraction import AttractionData
from .mrt import MrtData

from .user import UserData