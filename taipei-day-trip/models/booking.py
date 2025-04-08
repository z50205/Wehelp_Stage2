from pydantic import BaseModel
from typing import Optional
from . import cnxpool,conn
import uuid

class BookingData(BaseModel):
    attractionId:int
    date:str
    time:str
    price:int
    user_id:str

    @classmethod
    def getBookingInfo(self,userId):
        try:
            cnx=cnxpool.get_connection()
            cur=cnx.cursor()
            sql="select attr.name,attr.address,attr.images,book.attractionId,book.date,book.time,book.price from bookings book JOIN attractions attr on book.attractionId=attr.id where book.user_id=%s;"
            val=(userId,)
            cur.execute(sql,val)
            result = cur.fetchall()
            cnx.close()
            return {"data":{"attraction":{"id":result[0][3],"name":result[0][0],"address":result[0][1],"image":image_converter(result[0][2])},"date":result[0][4],"time":result[0][5],"price":result[0][6]}}
        except Exception as e:
            return {"error": True,"message":"Get record fail."}
    
    @classmethod
    def createBookingInfo(self,userId,attractionId,date,time,price):
        try:
            cnx=cnxpool.get_connection()
            cur=cnx.cursor()
            sql="delete from bookings where bookings.user_id=%s"
            val=(userId,)
            cur.execute(sql,val)
            cnx.commit()
            cur=cnx.cursor()
            sql="insert into bookings (id,user_id,attractionId,date,time,price) values (%s,%s,%s,%s,%s,%s)"
            val=(str(uuid.uuid4()),userId,attractionId,date,time,price)
            cur.execute(sql,val)
            cnx.commit()
            cnx.close()
            return {"ok": True}
        except:
            return {"error": True,"message":"Create record fail."}
        
    @classmethod
    def deleteBookingInfo(self,userId):
        try:
            cnx=cnxpool.get_connection()
            cur=cnx.cursor()
            sql="delete from bookings where bookings.user_id=%s"
            val=(userId,)
            cur.execute(sql,val)
            cnx.commit()
            cnx.close()
            return {"ok": True}
        except:
            return {"error": True,"message":"delete record fail."}
        
def image_converter(data):
    images_raw=data.split("https")
    images=[]
    for img in images_raw:
        if img[-3:]=='png' or img[-3:]=='PNG'  or img[-3:]=='jpg'  or img[-3:]=='JPG':
            images.append("https"+img)
    return images[0]