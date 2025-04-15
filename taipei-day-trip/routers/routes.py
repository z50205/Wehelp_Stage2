from fastapi import APIRouter, Request,Form,Depends,HTTPException,status
from typing import Annotated
from fastapi.responses import HTMLResponse,RedirectResponse,JSONResponse
from fastapi.requests import HTTPConnection
import os
from models import AttractionData,MrtData,UserData,BookingData,OrderData
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
    result=MrtData.getMrts()
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.post("/api/user",response_class=HTMLResponse, tags=["createUser"])
async def createUser(request: Request,name:str=Form(...),email:str=Form(...),password:str=Form(...)):
    result=UserData.createUser(name,email,password)
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.get("/api/user/auth",response_class=HTMLResponse, tags=["getUserInfo"])
async def getUserInfo(request: Request):
    jwt_token=request.headers["authorization"].split("Bearer ")[1]
    result=UserData.getUser(jwt_token)
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.put("/api/user/auth",response_class=HTMLResponse, tags=["loginUser"])
async def loginUser(request: Request,email:str=Form(...),password:str=Form(...)):
    result=UserData.loginUser(email,password)
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.get("/api/booking",response_class=HTMLResponse, tags=["getBookingInfo"])
async def getUserInfo(request: Request):
    jwt_token=request.headers["authorization"].split("Bearer ")[1]
    login_result=UserData.getUser(jwt_token)
    if(login_result):
        userId=login_result["data"]["id"]
        result=BookingData.getBookingInfo(userId)
    else:
        result={"error": True,"message":"Log in fail."}
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.post("/api/booking",response_class=HTMLResponse, tags=["createBookingInfo"])
async def createBookingInfo(request: Request,attractionId:int=Form(...),date:str=Form(...),time:str=Form(...),price:int=Form(...)):
    jwt_token=request.headers["authorization"].split("Bearer ")[1]
    login_result=UserData.getUser(jwt_token)
    if(login_result):
        userId=login_result["data"]["id"]
        result=BookingData.createBookingInfo(userId,attractionId,date,time,price)
    else:
        result={"error": True,"message":"Log in fail."}
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.delete("/api/booking",response_class=HTMLResponse, tags=["deleteBookingInfo"])
async def deleteBookingInfo(request: Request):
    jwt_token=request.headers["authorization"].split("Bearer ")[1]
    login_result=UserData.getUser(jwt_token)
    if(login_result):
        userId=login_result["data"]["id"]
        result=BookingData.deleteBookingInfo(userId)
    else:
        result={"error": True,"message":"Log in fail."}
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.post("/api/orders",response_class=HTMLResponse, tags=["createOrder"])
async def createOrders(request: Request):
    jwt_token=request.headers["authorization"].split("Bearer ")[1]
    login_result=UserData.getUser(jwt_token)
    if(login_result):
        userId=login_result["data"]["id"]
    else:
        result={"error": True,"message":"Log in fail."}
        return JSONResponse(status_code=status.HTTP_200_OK,content=result)
    data = await request.json()
    prime=data['prime']
    email=data['order']['contact']['email']
    phone=data['order']['contact']['phone']
    name=data['order']['contact']['name']
    items=[{"attraction_id":data['order']['trip']['attraction']['id'],"date":data['order']['trip']['date'],"time":data['order']['trip']['time'],"price":data['order']['price']}]
    result=OrderData.createOrder(userId,name,email,phone,items)
    if "ok" in result:
        result=OrderData.payOrderPrime(prime,result["order_id"],name,items[0]["price"],phone)
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)

@router.get("/api/order/{order_id}",response_class=HTMLResponse, tags=["getOrder"])
async def createOrders(request: Request,order_id:str):
    jwt_token=request.headers["authorization"].split("Bearer ")[1]
    login_result=UserData.getUser(jwt_token)
    if(login_result):
        user_id=login_result["data"]["id"]
    else:
        result={"error": True,"message":"Log in fail."}
        return JSONResponse(status_code=status.HTTP_200_OK,content=result)
    result=OrderData.getOrder(user_id,order_id)
    return JSONResponse(status_code=status.HTTP_200_OK,content=result)