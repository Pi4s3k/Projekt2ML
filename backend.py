from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import base64
import os

class MyFile(BaseModel):
    data: str
    name: str
    type: str
    sep: str
    decimal: str


app = FastAPI()

origins = [
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#@app.get("/")
#def read_root():
#    return {"Hello": "World"}


@app.post("/getFile")
async def read_dupa(obj: MyFile):
    print(obj.type,obj.name)
    file_name=obj.name +'.'+ obj.type
    file_content=base64.b64decode(obj.data).decode('utf-8')
    with open(file_name,"w+") as f:
        f.write(str(file_content))
    df=pd.read_csv(file_name,sep=obj.sep,decimal=obj.decimal)
    print(df.columns)
    os.remove(file_name)

@app.get('/pic')
def send_graph():
    return { "dupa" : "dupa" } 





    
    


