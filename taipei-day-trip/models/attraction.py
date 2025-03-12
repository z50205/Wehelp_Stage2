from pydantic import BaseModel
from typing import Optional
from . import cnxpool,conn

class AttractionData(BaseModel):
    id:int=None
    name:str=None
    category:str=None
    description:str=None
    address:str=None
    transport:str=None
    mrt:Optional[int]=None
    lat:float=None
    lng:float=None
    images:str=None

    @classmethod
    def getAttractions(self,page,keyword):
        perpage=12
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        if keyword:
            sql="select a.id,a.name,a.category,a.description,a.address,a.transport,m.mrt_name,a.lat,a.lng,a.images\
                 from attractions a Join mrts m on m.id=a.mrt where m.mrt_name = %s OR a.name like %s Limit %s offSET %s;"
            val=(keyword,"%"+keyword+"%",perpage+1,page*perpage)
        else:
            sql="select a.id,a.name,a.category,a.description,a.address,a.transport,m.mrt_name,a.lat,a.lng,a.images \
             from attractions a Join mrts m on m.id=a.mrt Limit %s offSET %s;"
            val=(perpage+1,page*perpage)
        cur.execute(sql,val)
        result = cur.fetchall()
        cnx.close()
        attractions=[]
        for i in range(min(perpage,len(result))):
            attractions.append({"id":result[i][0],"name":result[i][1],"category":result[i][2],"description":result[i][3],"address":result[i][4],
                                          "transport":result[i][5],"mrt":result[i][6],"lat":result[i][7],"lng":result[i][8],"images":images_converter(result[i][9])})
        if len(result)==perpage+1:
            ans=page+1
        else:
            ans=None
        return {"nextPage":ans,"data":attractions}
    
    @classmethod
    def getAttraction(self,id):
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        sql="select a.id,a.name,a.category,a.description,a.address,a.transport,m.mrt_name,a.lat,a.lng,a.images\
        from attractions a Join mrts m on m.id=a.mrt where a.id = %s;"
        val=(id,)
        cur.execute(sql,val)
        result = cur.fetchall()
        cnx.close()
        if result:
            return {"status":200,"route_data":{"data":{"id":result[0][0],"name":result[0][1],"category":result[0][2],"description":result[0][3],"address":result[0][4],
                                          "transport":result[0][5],"mrt":result[0][6],"lat":result[0][7],"lng":result[0][8],"images":images_converter(result[0][9])}}}
        else:
            return {"status":400}
    
def images_converter(data):
    images_raw=data.split("https")
    images=[]
    for img in images_raw:
        if img[-3:]=='png' or img[-3:]=='PNG'  or img[-3:]=='jpg'  or img[-3:]=='JPG':
            images.append("https"+img)
    return images