from re import M
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import base64
import os
import matplotlib.pyplot as plt
import io

#zmienne globalne g-przysp ziemskie, rho-gestosc powietrza na poziomie morza, ni0-lepkość kinematyczna

g=9.81 #m/s2
rho=1.2255 #kg/m3
ni0=1.461*pow(10,-5) #m^2/s

class MyFile(BaseModel):
    data: str
    name: str
    type: str
    sep: str
    decimal: str
    wingspan: np.float64
    wingsurface: np.float64
    mass: np.float64
    MAC: np.float64


app = FastAPI()

origins = [
    "http://127.0.0.1:5173","*",
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
    plt.figure()
    plt.plot(df['alpha'],df['cz'])
    plt.savefig(my_stringIObytes,dpi=300,format='png')
    my_stringIObytes.seek(0)
    my_base64_pngData = base64.b64encode(my_stringIObytes.read())
    plt.close()
    return my_base64_pngData


#Funkcja szacująca prędkość przeciągnięcia Vs1
def stallspeed(mass,wing_surface,cz_max):
    Vs1=np.sqrt((2*mass*g)/(rho*wing_surface*cz_max))
    return Vs1

#Funkcja szacująca liczbę Reynoldsa dla minimalnej prędkości lotu
def Reynolds(Vs1,MAC):
    re=(Vs1*MAC)/ni0
    return re

# Korekta współczynnika oporu profilu płata związana z liczbą Reynoldsa
def cxre(df,cz_max,cx_min1,Re1):
    cx_min2=cx_min1*pow((Re1/pow(10,7)),0.11)
    df['deltacxre']=(cx_min2-cx_min1)*(1-np.abs(df['cz']/cz_max))
    df['cxprim']=df['cx']+df['deltacxre']
    return df


@app.post("/getFile")
async def read_dupa(obj: MyFile):
#Dekodowanie pliku
    file_name=obj.name +'.'+ obj.type
    file_content=base64.b64decode(obj.data).decode('utf-8')
    with open(file_name,"w+") as f:
        f.write(str(file_content))
#Utworzenie df'a na podstawie pliku
    df=pd.read_csv(file_name, sep=obj.sep, decimal=obj.decimal)
#deklaracja wartości czmax i cxmin
    czmax=df['cz'].max()
    cxmin=df['cx'].min()
#Obliczenia Vs1,Re1
    Vs1=stallspeed(obj.mass, obj.wingsurface, czmax)
    Re1=Reynolds(Vs1,obj.MAC)

#Obliczenia korekty współczynnika oporu profilu płata związana z liczbą Reynoldsa
    df=cxre(df,czmax,cxmin,Re1)
#Usunięcie pliku
    os.remove(file_name)
#Tworzenie wykresu w postacie stringa base64
    global graph #zmienna globalna przekazwyana dalej do funckji get
    graph=create_graph(df)




#Funkcja przesyłająca wykres do frontendu
@app.get('/pic')
def send_graph():
#graph - base64pngwykresu
    return { "graph" : graph } 





    
    


