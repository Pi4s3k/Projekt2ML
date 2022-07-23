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


function sendToBE(){
  let fileloc = btoa(file)
  let filetype = file.name.split('.')[1];
  console.log(file)
  axios.post('http://127.0.0.1:8000/getFile',{data : fileloc, type : filetype})
};
 


  return (
    <div className="App">
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
      <Button variant="contained" onClick={sendToBE}>Contained</Button>

    </div>
  )
}

export default App
