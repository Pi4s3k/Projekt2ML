import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Button from '@mui/material/Button';
import { FileUploader } from "react-drag-drop-files";
import axios from 'axios';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const fileTypes = ["csv"];

let dataobj;

function App() {

  const [file, setFile] = useState(null);
  const [graph1, setGraph1] = useState(null);
  const [graph2, setGraph2] = useState(null);
  const [wings, setWings] = useState("composite-metal");

  const handleChange = (file) => {
    setFile(file);
  };

  const handleChangeWings = (event) => {
    setWings(event.target.value);
    console.log("wings: " + event.target.value);
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
      let macinput = document.getElementById("MAC-input").value;
      let crinput = document.getElementById("Cr-input").value;
      let ctinput = document.getElementById("Ct-input").value;
      let b25input = document.getElementById("b25-input").value;
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
      mass : massinput,
      MAC : macinput,
      Wings : wings,
      Cr : crinput,
      Ct : ctinput,
      b25 : b25input
    });
      axios.get('http://localhost:8000/pic')
      .then(function (response) {
        setGraph1("data:image/png;base64,"+response.data.graph1)
        setGraph2("data:image/png;base64,"+response.data.graph2)
        console.log(response.data.graph2)
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
      <TextField variant="standard" label="csv separator" id="separator-input" defaultValue={','} />
      <TextField variant="standard" label="csv decimal" id="decimal-input" defaultValue={'.'}/>
      <TextField variant="standard" label="MAC" id="MAC-input" defaultValue={'1.9'}/>
      <TextField variant="standard" label="Chord root" id="Cr-input" defaultValue={'1.9'}/>
      <TextField variant="standard" label="Chord tip" id="Ct-input" defaultValue={'1.9'}/>
    </div>
    <div className="text">
      <TextField variant="standard" label="Wing Span" id="wing_span-input" defaultValue={'15.87'}/>
      <TextField variant="standard" label="Wing Surface" id="wing_surface-input" defaultValue={'30.15'}/>
      <TextField variant="standard" label="Mass" id="mass-input" defaultValue={'2650'}/>
      <TextField variant="standard" label="β25" id="b25-input" defaultValue={'0'}/>
    </div>

{/* wybór rodzaju skrzydeł do wyliczenia oporu */}

<FormControl>
      <FormLabel id="demo-radio-buttons-group-label">Rodzaj skrzydeł</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        defaultValue="composite-metal"
        onChange={handleChangeWings}
        
      >
        <FormControlLabel value="composite-metal" control={<Radio />} label="Kompozytowe/metalowe" />
        <FormControlLabel value="wooden" control={<Radio />} label="Drewniane" />
      </RadioGroup>
    </FormControl>

{/* Koniec wyboru rodzaju skrzydeł */}

    <div><Button variant="contained" onClick={sendToBE}>Sent ot BE</Button></div>
    <div className='image'>
        <img src={graph1} />
    </div>
    <div className='image'>
        <img src={graph2} />
    </div>
      
    </div>
  )
}

export default App
