import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Button from '@mui/material/Button';
import { FileUploader } from "react-drag-drop-files";
import axios from 'axios';

const fileTypes = ["xlsx", "csv"];

let dataobj;

function App() {

  const [file, setFile] = useState(null);

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
      axios.post('http://127.0.0.1:8000/getFile',{data : dataobj, name : filename, type : filetype});
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
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
      <Button variant="contained" onClick={sendToBE}>Sent ot BE</Button>
    </div>
  )
}

export default App
