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
      let filename= file.name.split('.')[0];
      let filetype = file.name.split('.')[1];
      let sepinput=document.getElementById("separator-input").value;
      let decimalinput = document.getElementById("decimal-input").value;
      axios.post('http://127.0.0.1:8000/getFile',{data : dataobj, name : filename, type : filetype, sep : sepinput, decimal : decimalinput});
      axios.get('http://localhost:8000/pic')
      .then(function (response) {
        setGraph(response.data.graph)
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
      <div><h1>Plik CSV powinien zawierać kolumny nazwane cz,cx, alpha</h1></div>
      <div className="FileUploader"><FileUploader handleChange={handleChange} name="file" types={fileTypes} /></div>
      <div><Button variant="contained" onClick={sendToBE}>Sent ot BE</Button></div>
      <div><TextField variant="standard" label="csv separator" id="separator-input" /></div>
      <div><TextField variant="standard" label="csv decimal" id="decimal-input" /></div>
      <div><TextField variant="standard" label="MAC" id="MAC-input" /></div>
      <img src={"data:image/jpeg;base64," + graph} />
    </div>
  )
}

export default App
