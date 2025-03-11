import json
import os
import csv
import http.client

import mysql.connector as conn
import mysql.connector.pooling as pooling
from mysql.connector import errorcode
from dotenv import load_dotenv
import os

load_dotenv()
DB_USERNAME = os.environ.get("DB_USERNAME","1234")
DB_PASSWORD = os.environ.get("DB_PASSWORD","1234")

# Step1：讀取各景點資料為json
with open("taipei-day-trip/data/taipei-attractions.json", 'r',encoding="utf-8") as json_file:
    spot_info_json=json.loads(json_file.read())


# Step2：mysql伺服器建立
dbconfig = {
  "host":"localhost",
  "database": "website",
  "user":DB_USERNAME,
  "password":DB_PASSWORD,
}

cnxpool = pooling.MySQLConnectionPool(pool_name = "mypool",pool_size = 20,**dbconfig)

# Step2：attractions資料表建立[id,name,description,address,transport,mrt,lat,lng,images]
try:
    cnx=cnxpool.get_connection()
    cur=cnx.cursor()
    cur.execute("use website;")
    cur.execute("create table attractions(\
    id bigint primary key AUTO_INCREMENT,\
    name varchar(255) NOT NULL,\
    category varchar(255) NOT NULL,\
    description varchar(2000) NOT NULL,\
    address varchar(255) NOT NULL,\
    transport varchar(500) NOT NULL,\
    mrt varchar(255),\
    lat FLOAT NOT NULL,\
    lng FLOAT NOT NULL,\
    images varchar(5000) NOT NULL\
    );")
    for i in range(len(spot_info_json["result"]["results"])):
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        id_v=spot_info_json["result"]["results"][i]["_id"]
        name_v=spot_info_json["result"]["results"][i]["name"]
        category_v=spot_info_json["result"]["results"][i]['CAT']
        description_v=spot_info_json["result"]["results"][i]["description"]
        address_v=spot_info_json["result"]["results"][i]["address"]
        transport_v=spot_info_json["result"]["results"][i]["direction"]
        mrt_v=spot_info_json["result"]["results"][i]["MRT"]
        lat_v=spot_info_json["result"]["results"][i]["latitude"]
        lng_v=spot_info_json["result"]["results"][i]["longitude"]
        images_v=spot_info_json["result"]["results"][i]["file"]
        sql=("Insert into attractions (id,name,category,description,address,transport,mrt,lat,lng,images) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);")
        val = (id_v,name_v,category_v,description_v,address_v,transport_v,mrt_v,lat_v,lng_v,images_v)
        cur.execute(sql, val)
        cnx.commit()
        cnx.close()

except conn.Error as err:
    if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
        print("already exists.")
    else:
        print(err)
        exit(1)
cnx.close()