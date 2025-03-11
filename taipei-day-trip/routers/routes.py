from fastapi import APIRouter, Request,Form,Depends,HTTPException,status
from typing import Annotated
from fastapi.responses import HTMLResponse,RedirectResponse,JSONResponse
from fastapi.requests import HTTPConnection
import os
from models import AttractionData
import json

router = APIRouter()

@router.get("/api/attractions",response_class=HTMLResponse, tags=["getattractions"])
async def getAllAtractions(request: Request,page:int,keyword:str=None):
    result=AttractionData.getAttractions(page,keyword)
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.get("/api/attraction/{attractionId}",response_class=HTMLResponse, tags=["getattraction"])
async def getAllAtraction(request: Request,attractionId:int):
    result=AttractionData.getAttraction(attractionId)
    if result["status"]==200:
        return JSONResponse(status_code=status.HTTP_200_OK,content=result["route_data"])
    elif result["status"]==400:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST,content={"error": True,"message": "Not found specific attraction."})
    

@router.get("/api/mrts",response_class=HTMLResponse, tags=["getmrts"])
async def getAllMrts(request: Request):
    result=AttractionData.getMrts()
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)