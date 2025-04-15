from pydantic import BaseModel
from typing import Optional
from . import cnxpool,conn,ItemData
import os,uuid,http.client,json
from dotenv import load_dotenv

load_dotenv()
APP_KEY = os.environ.get("APP_KEY","NOKEY")

class OrderData(BaseModel):
    id:str #pk
    userId:str #nn
    name:str #nn
    email:str #nn
    phone:str #nn
    status:Optional[int] #nn
    isPaid:bool=False #nn

    @classmethod
    def createOrder(self,userId,name,email,phone,items):
        try:
            cnx=cnxpool.get_connection()
            cur=cnx.cursor()
            order_id=str(uuid.uuid4())
            sql="insert into orders (id,user_id,name,email,phone,is_paid) values (%s,%s,%s,%s,%s,%s)"
            val=(order_id,userId,name,email,phone,False)
            cur.execute(sql,val)
            cnx.commit()
            cnx.close()
            for item in items:
                item_result=ItemData.createItem(order_id,item["attraction_id"],item["date"],item["time"],item["price"])
                if "error" in item_result:
                    return  item_result
            return {"ok": True,"order_id":order_id}
        except:
            return {"error": True,"message":"Create order record fail."}
        
    @classmethod
    def payOrderPrime(self,prime,order_id,name,price,phone):
        conn = http.client.HTTPSConnection("sandbox.tappaysdk.com")
        headers = {"Content-type": "application/json","x-api-key": APP_KEY}
        params={
            "prime":prime,
            "partner_key": APP_KEY,
            "merchant_id": "z50205_FUBON_POS_2",
            "details":"TapPay Test",
            "amount": price,
            "cardholder": {
            "phone_number": phone,
            "name": name,
            "email": "LittleMing@Wang.com",
            "zip_code": "100",
            "address": "台北市天龍區芝麻街1號1樓",
            "national_id": "A123456789"
            },
            "remember": True
        }
        conn.request("POST", "/tpc/payment/pay-by-prime", json.dumps(params), headers)
        response = conn.getresponse()
        result=json.loads(response.read().decode())
        if result["msg"]=="Success":
            try:
                cnx=cnxpool.get_connection()
                cur=cnx.cursor()
                sql = "UPDATE orders SET is_paid = %s,status=%s WHERE id = %s"
                val = (True,result["status"], order_id)
                cur.execute(sql,val)
                cnx.commit()
                cnx.close()
                result={
                    "data": {
                    "number": order_id,
                    "payment": {
                        "status": 0,
                        "message": "付款成功"}
                        }
                    }
            except:
                result={"error": True,"message":"Update order record failed."}
        else:
            try:
                cnx=cnxpool.get_connection()
                cur=cnx.cursor()
                sql = "UPDATE orders SET status = %s WHERE id = %s"
                val = (result["status"], order_id)
                cur.execute(sql,val)
                cnx.commit()
                cnx.close()
                result={"error": True,"message":"Payment failed."}
            except:
                result={"error": True,"message":"Update order record failed."}
        return result
    @classmethod
    def getOrder(self,user_id,order_id):
        try:
            cnx=cnxpool.get_connection()
            cur=cnx.cursor()
            sql = "select O.id,I.price,A.id,A.name,A.address,A.images,I.date,I.time,O.name,O.email,O.phone,O.status from items I Join orders O on I.order_id=O.id Join attractions A on I.attractionId=A.id where I.order_id=%s"
            val = (order_id,)
            cur.execute(sql,val)
            result = cur.fetchall()
            res = result[0]
            cnx.close()
            result={"data":{
                "number":res[0],
                "price":res[1],
                "trip":{
                    "attraction":{
                        "id":res[2],"name":res[3],"address":res[4],"image":images_converter(res[5][0])
                    },
                    "date":res[6],
                    "time":res[7],
                },
                "contact": {
                    "name": res[8],
                    "email": res[9],
                    "phone":res[10],
                },
                "status": res[11]
            }}
        except:
            result={"error": True,"message":"Get record failed."}
        return result
    
def images_converter(data):
    images_raw=data.split("https")
    images=[]
    for img in images_raw:
        if img[-3:]=='png' or img[-3:]=='PNG'  or img[-3:]=='jpg'  or img[-3:]=='JPG':
            images.append("https"+img)
    return images

        