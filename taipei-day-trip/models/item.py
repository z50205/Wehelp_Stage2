from pydantic import BaseModel
from typing import Optional
from . import cnxpool,conn
import uuid

class ItemData(BaseModel):
    id:int #pk
    orderId:str #fk
    attractionId:int #fk
    date:str #nn
    time:str #nn
    price:int #nn

    @classmethod
    def createItem(self,orderId,attractionId,date,time,price):
        try:
            cnx=cnxpool.get_connection()
            cur=cnx.cursor()
            sql="insert into items (id,order_id,attractionId,date,time,price) values (%s,%s,%s,%s,%s,%s)"
            val=(str(uuid.uuid4()),orderId,attractionId,date,time,price)
            cur.execute(sql,val)
            cnx.commit()
            cnx.close()
            return {"ok": True}
        except:
            return {"error": True,"message":"Create item record fail."}
    