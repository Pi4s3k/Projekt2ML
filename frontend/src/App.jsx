import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Button from '@mui/material/Button';
import { FileUploader } from "react-drag-drop-files";
import axios from 'axios';

const fileTypes = ["xlsx", "csv"];

function App() {

  const [file, setFile] = useState(null);

  const handleChange = (file) => {
    setFile(file);
  };


function getBase64(file) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     console.log(reader.result.split(',')[1]);
   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };
}

function sendToBE(){
  let fileloc = getBase64(file);
  let filename= file.name.split('.')[0];
  let filetype = file.name.split('.')[1];
  axios.post('http://127.0.0.1:8000/getFile',{data : String(getBase64(file)), name : filename, type : filetype});
};

async function sendToBE2(){
  let fileloc = null;
  const obietnica = fileloc = getBase64(file);
  console.log(obietnica)
  let filename= file.name.split('.')[0];
  let filetype = file.name.split('.')[1];
  axios.post('http://127.0.0.1:8000/getFile',{data : fileloc, name : filename, type : filetype});
};



 


  return (
    <div className="App">
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
      <Button variant="contained" onClick={sendToBE}>Sent ot BE</Button>
      <Button variant="contained" onClick={sendToBE2}>Send to BE2</Button>

    </div>
  )
}

export default App
