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
    Cr : np.float64
    Ct : np.float64
    b25 : np.float64
    iseliptical : bool
    dragslidervalue : np.float64

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

#Funkcja tworząca wykres cz(alpha)
def create_graph1(df):
    my_stringIObytes = io.BytesIO()
    plt.figure()
    plt.grid()
    plt.plot(df['alpha'],df['cz'],label='Profil')
    plt.plot(df['alphap'],df['cz'],color='red',label='Płat')
    plt.xlabel('$\\alpha[^\circ]$')
    plt.ylabel('Cz[-]')
    plt.legend()
    plt.savefig(my_stringIObytes,dpi=300,format='png')
    my_stringIObytes.seek(0)
    my_base64_pngData = base64.b64encode(my_stringIObytes.read())
    plt.close()
    return my_base64_pngData

#Funkcja tworząca wykres Cz(cx)
def create_graph2(df):
    my_stringIObytes = io.BytesIO()
    plt.figure()
    plt.grid()
    plt.plot(df['cz'],df['cx'],label='Profil')
    plt.plot(df['cz'],df['cxp'],color='red',label='Płat')
    plt.xlabel('Cz[-]')
    plt.ylabel('Cx[-]')
    plt.legend()
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

#Funkcja obliczająca Cx tech
def cxtech(df,dragslidervalue):
    cx_min=df['cxprim'].min()
    return cx_min*dragslidervalue

#Funkcja obliczająca Cx indukowane płata
def cxindukowane(df,AR,glauertdelta):
    df['cxi']=((np.power(df['cz'],2))/(np.pi*AR))*(1+glauertdelta)
    return df

#Funkcja obliczająca a_inf na podstawie charakterystyk z pliku
#Ta funkcja obsługuje narazie tylko alpha w stopniach, w przyszłości trzeba dodać obsługę charakterystyk w radianach
def ainf(dffunkcja):
    dffunkcja['alpha']=np.deg2rad(dffunkcja['alpha'])
    dffunkcja=dffunkcja.loc[(dffunkcja['cz'] <= dffunkcja['cz'].max()*0.8) & (dffunkcja['cz'] >= dffunkcja['cz'].min()*0.8)]
    coef=np.polyfit(dffunkcja['alpha'],dffunkcja['cz'],1)
    wielomian=np.poly1d(coef)
    return np.polyder(wielomian)


#Funkcje obliczające wsp korekcyjne glauerta
def glauerttau(AR,TR,a,iseliptical):
    if iseliptical==False:
        #tau1
        coeftau1=[0.023,-0.103,0.25,0]
        ptau1=np.poly1d(coeftau1)
        tau1=ptau1(AR/a)
        #tau2
        coeftau2=[-0.18,1.52,-3.51,3.5,-1.33,0.17]
        ptau2=np.poly1d(coeftau2)
        tau2=ptau2(TR)
        #tau
        tau=(tau1*tau2)/(0.17)
        return tau
    elif iseliptical==True:
        return 0

def glauertdelta(AR,TR,a,b25,iseliptical):
    if iseliptical==False:
        #delta1
        delta1=0.0537*(AR/a)-0.005
        #delta2
        coefdelta2=[-0.43,1.83,-3.06,2.56,-1,0.148]
        pdelta2=np.poly1d(coefdelta2)
        delta2=pdelta2(TR)
        #delta3
        coefdelta3=[-2.2*pow(10,-7),pow(10,-7),1.6*pow(10,-5),0]
        pdelta3=np.poly1d(coefdelta3)
        delta3=(pdelta3(AR))*pow(b25,3)+1
        #delta
        delta=(delta1*delta2*delta3)/(0.048)
        return delta
    elif iseliptical==True:
        return 0

#Funkcja obliczająca indukowany kąt natarcia (OBLICZENIA W RADIANACH NA SAM KONIEC KONWERSJA W STOPNIE)
def alphaind(df,AR,glauerttau):
    df['alphai']=((df['cz'])/(np.pi*AR))*(1+glauerttau)
    df['alphai']=np.rad2deg(df['alphai'])
    return df

@app.post("/getFile")
async def read_dupa(obj: MyFile):
    print(obj.sep,obj.decimal)
    print(obj.wingspan,obj.Cr,obj.Ct)
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
    print(df['alpha'])
#Obliczenia a_inf,AR,TR
    a=ainf(df)
    df['alpha']=np.rad2deg(df['alpha']) #z jakiegoś powodu w funkcji ainf następuje globalna zmiana deg2rad to jest temp fix
    AR=pow(obj.wingspan,2)/(obj.wingsurface)
    TR=(obj.Ct)/(obj.Cr)
    b25=obj.b25

#Obliczenia wsp. korekcyjnych Glauerta
    tau=glauerttau(AR,TR,a,obj.iseliptical)
    delta=glauertdelta(AR,TR,a,b25,obj.iseliptical)

#Obliczenia  Cx technicznego
    global cxtechniczny
    cxtechniczny=cxtech(df,obj.dragslidervalue)

#Obliczenia Cx indukowanego (do sprawdzenia poprawność obliczeń)
    df=cxindukowane(df,AR,delta)

#Obliczenia całkowitego oporu płata
    df['cxp']=df['cx']+cxtechniczny+df['cxi']

#Obliczenia indukowanego kąta natarcia
    df=alphaind(df,AR,tau)
#Obliczenia kąta natarcia płata
    df['alphap']=df['alpha']+df['alphai']

#Usunięcie pliku
    os.remove(file_name)

    global platxczalpha
    platxczalpha=df['alphap'].to_list()

    global platyczalpha
    platyczalpha=df['cz'].to_list()

    global profilxczalpha
    profilxczalpha=df['alpha'].to_list()

    global profilyczalpha
    profilyczalpha=df['cz'].to_list()

    global profilxczcx
    profilxczcx=df['cz'].to_list()

    global profilyczcx
    profilyczcx=df['cx'].to_list()

    global platxczcx
    platxczcx=df['cz'].to_list()

    global platyczcx
    platyczcx=df['cxp'].to_list()

    global cx_min
    cx_min=df['cxprim'].min()
  



#Testowa funkcja odbierająca odsyłająca dane wykresu w postaci obiektu z listą
@app.get('/data')
def send_list():
    print(np.round(cxtechniczny,3))
    return {
        "x_graph1":platxczalpha,
        "y_graph1":platyczalpha,
        "x_graph2":profilxczalpha,
        "y_graph2":profilyczalpha,
        "x_graph4":profilxczcx,
        "y_graph4":profilyczcx,
        "x_graph3":platxczcx,
        "y_graph3":platyczcx,
        "name1":"Płat",
        "name2":"Profil",
        "name4":"Profil",
        "name3":"Płat",
        "techdrag":np.round(cx_min,4)
    }





    
    


