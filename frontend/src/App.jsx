import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Button from '@mui/material/Button';
import { FileUploader } from "react-drag-drop-files";
import axios from 'axios';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';

const fileTypes = ["csv"];

let dataobj;

function App() {

  const [file, setFile] = useState(null);
  const [graph, setGraph] = useState(null);

  const handleChange = (file) => {
    setFile(file);
  };


function getBase64(file) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
      dataobj=reader.result.split(',')[1];
      console.log(dataobj)
      {/* Tutaj deklaracja zmienny odczytanych z text fieldów*/}
      let filename= file.name.split('.')[0];
      let filetype = file.name.split('.')[1];
      let sepinput=document.getElementById("separator-input").value;
      let decimalinput = document.getElementById("decimal-input").value;
      let wingspaninput = document.getElementById("wing_span-input").value;
      let wingsurfaceinput = document.getElementById("wing_surface-input").value;
      let massinput = document.getElementById("mass-input").value;
      {/* Tutaj wysłanie zapytania do backendu z odczytanymi zmiennymi */}
      axios.post('http://127.0.0.1:8000/getFile',
      {
      data : dataobj, 
      name : filename, 
      type : filetype, 
      sep : sepinput, 
      decimal : decimalinput,
      wingspan : wingspaninput,
      wingsurface : wingsurfaceinput,
      mass : massinput
    });
      axios.get('http://localhost:8000/pic')
      .then(function (response) {
        setGraph("data:image/png;base64,"+response.data.graph)
        console.log(response.data.graph)
      })
      .catch(function (error) {
        console.log(error);
      })
   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };

}

function sendToBE(){
  getBase64(file);
};


  return (
    <div className="App">
      <div><h1>Plik CSV powinien zawierać kolumny cz, cx, alpha</h1></div>
    <div className='File'>
      <div className="FileUploader"><FileUploader handleChange={handleChange} name="file" types={fileTypes} /></div>
    </div>
      
    <div className="text">
      <TextField variant="standard" label="csv separator" id="separator-input" />
      <TextField variant="standard" label="csv decimal" id="decimal-input" />
      <TextField variant="standard" label="MAC" id="MAC-input" />
    </div>
    <div className="text">
      <TextField variant="standard" label="Wing Span" id="wing_span-input" />
      <TextField variant="standard" label="Wing Surface" id="wing_surface-input" />
      <TextField variant="standard" label="Mass" id="mass-input" />
    </div>
    <div><Button variant="contained" onClick={sendToBE}>Sent ot BE</Button></div>
    <div className='image'>
        <img src={graph} />
    </div>
      
    </div>
  )
}

export default App
