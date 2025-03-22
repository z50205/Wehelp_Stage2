from pydantic import BaseModel
from typing import Optional
from . import cnxpool,conn

class MrtData(BaseModel):
    id:int=None
    mrt_name:Optional[str]=None

    @classmethod
    def getMrts(self):
        cnx=cnxpool.get_connection()
        cur=cnx.cursor()
        sql="select mrt_name from mrts;"
        cur.execute(sql,)
        result = cur.fetchall()
        cnx.close()
        mrts=[]
        for res in result:
            if res[0]:
                mrts.append(res[0])
        return {"data":mrts}