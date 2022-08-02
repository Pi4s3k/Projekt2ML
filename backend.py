from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import base64
import os
import matplotlib.pyplot as plt
import io

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

#Funkcja tworząca wykres
def create_graph(df):
    my_stringIObytes = io.BytesIO()
    plt.plot(df['alpha'],df['cz'])
    plt.savefig(my_stringIObytes,dpi=300,format='png')
    my_stringIObytes.seek(0)
    my_base64_pngData = base64.b64encode(my_stringIObytes.read())
    return my_base64_pngData

@app.post("/getFile")
async def read_dupa(obj: MyFile):
#Definicja nazwy pliku
    file_name=obj.name +'.'+ obj.type
#Dekodowanie pliku
    file_content=base64.b64decode(obj.data).decode('utf-8')
    with open(file_name,"w+") as f:
        f.write(str(file_content))
#Utworzenie df'a na podstawie pliku
    df=pd.read_csv(file_name,sep=obj.sep,decimal=obj.decimal)
#Usunięcie pliku
    os.remove(file_name)
#Tworzenie wykresu w postacie stringa base64
    global graph
    graph=create_graph(df)

@app.get('/pic')
def send_graph():
    return { "graph" : graph } 





    
    


