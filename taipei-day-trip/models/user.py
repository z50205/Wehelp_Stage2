from pydantic import BaseModel
import mysql.connector as conn
from typing import Optional
from . import cnxpool,conn,JWT_SECRET
from passlib.hash import pbkdf2_sha256
import time, datetime
from datetime import timezone
import uuid
import jwt

class UserData(BaseModel):
    id:str=None #pk nn un
    email:str=None #nn un
    password_hash:str=None #nn
    name:str=None #nn
    create_time:str=None

    def set_pw(self,password):
        return pbkdf2_sha256.hash(password)
    def check_pw(self,password,password_hash):
        return pbkdf2_sha256.verify(password, password_hash)

    @classmethod
    def createUser(self,name:str,email:str,password:str):
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        if name=='' or email=='' or password=='':
            message="Lack Infos"
            return {"error": True,"message": message}
        try:
            dt_iso = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace("+00:00", "Z")
            sql="Insert into users (id,email,password_hash,name,create_time) values (%s,%s,%s,%s,%s);"
            val=(str(uuid.uuid4()),email,self.set_pw(self,password),name,dt_iso)
            cur.execute(sql,val)
            cnx.commit()
            return {"ok":True}
        except conn.Error as err:
            if err.errno==1062:
                message="Repeated Email"
            return {"error": True,"message": message}
        except Exception as e:
            message="Something wrong, please contact webmaster."
            return {"error": True,"message": message}
        finally:
            cnx.close()

    @classmethod
    def loginUser(self,email:str,password:str):
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        try:
            sql="select * from users where email=%s;"
            val=(email,)
            cur.execute(sql,val)
            result = cur.fetchall()
            # User not exist.
            if len(result)==0:
                message="Email not exist."
                return {"error": True,"message":message}
            # User exist, auth correct.
            elif self.check_pw(self,password,result[0][2]):
                encoded_jwt = jwt.encode({"id":result[0][0],"name":result[0][1],"email":result[0][3],"exp": datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(days=7)}, JWT_SECRET, algorithm="HS256")
                return {"token":encoded_jwt}
            # User exist, auth incorrect.
            else:
                message="Login Failed"
                return {"error": True,"message":message}
            # Exception.
        except Exception as e:
            message="Something wrong, please contact webmaster."
            return {"error": True,"message": message}
        finally:
            cnx.close()

    @classmethod
    def getUser(self,jwt_token:str):
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        try:
            jwt_result=jwt.decode(jwt_token, JWT_SECRET, algorithms=["HS256"])
            # exist, all auth correct.
            sql="select * from users where id=%s;"
            val=(jwt_result["id"],)
            cur.execute(sql,val)
            result = cur.fetchall()
            return {"data":{"id":result[0][0],"name":result[0][1],"email":result[0][3]}}
            # expire.
        except jwt.exceptions.ExpiredSignatureError as e:
            print("Something went wrong: {}".format(e))
            return None
            # Exception:other exception

            # Exception:auth error.
        except jwt.exceptions.InvalidSignatureError as e:
            print("Something went wrong: {}".format(e))
            return None
            # Exception:other exception
        except Exception as e:
            print("Something went wrong: {}".format(e))
            return None
        finally:
            cnx.close()