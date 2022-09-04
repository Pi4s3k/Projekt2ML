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
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import BasicTabs from './tabs';

const fileTypes = ["csv"];
let dataobj;

function App() {

  const [file, setFile] = useState(null);
  const [wings, setWings] = useState("composite-metal");
  const [eliptical, setEliptical] = useState(false);
  const [graph1data, setGraph1data]=useState({
    x:null,
    y:null,
    name:null
  });

  const [graph2data, setGraph2data]=useState({
    x:null,
    y:null,
    name:null
  });

  const [graph3data, setGraph3data]=useState({
    x:null,
    y:null,
    name:null
  });

  const [graph4data, setGraph4data]=useState({
    x:null,
    y:null,
    name:null
  });

  const handleChange = (file) => {
    setFile(file);
  };

  const handleChangeWings = (event) => {
    setWings(event.target.value);
    console.log("wings: " + event.target.value);
  };

  const handleChangeEliptical = (event) => {
    setEliptical(event.target.checked);
    console.log("Eliptical: " + event.target.checked)
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
      b25 : b25input,
      iseliptical : eliptical
    });
      axios.get('http://localhost:8000/data')
      .then(function (response) {
        setGraph1data({x: response.data.x_graph1, y:response.data.y_graph1, name:response.data.name1})
        setGraph2data({x: response.data.x_graph2, y:response.data.y_graph2, name:response.data.name2})
        setGraph3data({x:response.data.x_graph3, y:response.data.y_graph3, name:response.data.name3})
        setGraph4data({x:response.data.x_graph4, y:response.data.y_graph4, name:response.data.name4})
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

function testowa(){
  axios.get('http://localhost:8000/data')
  .then(function (response){
    console.log(response.data.x)
    console.log(response.data.y)
  })
};

  return (
    <div className="App">
    <div className='split left'>
    <BasicTabs chuj={setFile}></BasicTabs>
    

      <div>
        <h1>Plik CSV powinien zawierać kolumny cz, cx, alpha</h1>
      </div>

      
    <div className="text">
      <TextField variant="standard" label="csv separator" id="separator-input" defaultValue={','}/>
      <TextField variant="standard" label="csv decimal" id="decimal-input" defaultValue={'.'}/>
      <TextField variant="standard" label="MAC" id="MAC-input" defaultValue={'1.9'}/>
    </div>

    <div className="text">
      <TextField variant="standard" label="Chord root" id="Cr-input" defaultValue={'1.9'}/>
      <TextField variant="standard" label="Chord tip" id="Ct-input" defaultValue={'1.9'}/>
      <TextField variant="standard" label="Wing Span" id="wing_span-input" defaultValue={'15.87'}/>
    </div>

    <div className="text">
      <TextField variant="standard" label="Wing Surface" id="wing_surface-input" defaultValue={'30.15'}/>
      <TextField variant="standard" label="Mass" id="mass-input" defaultValue={'2650'}/>
      <TextField variant="standard" label="β25" id="b25-input" defaultValue={'0'}/>
    </div>


<div className="text">
  {/* wybór rodzaju skrzydeł do wyliczenia oporu */}
<FormControl>
      <FormLabel id="demo-radio-buttons-group-label">Konstrukcja skrzydła</FormLabel>
      <RadioGroup
        row
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        defaultValue="composite-metal"
        onChange={handleChangeWings}>

        <FormControlLabel value="composite-metal" control={<Radio />} label="Kompozytowe/metalowe" />
        <FormControlLabel value="wooden" control={<Radio />} label="Drewniane" />
      </RadioGroup>
    </FormControl>
  {/* Koniec wyboru rodzaju skrzydeł */}
  <FormControl component="fieldset">
      <FormLabel component="legend">Skrzydło eliptyczne</FormLabel>
      <FormGroup aria-label="position">
        <FormControlLabel
          value="eliptical"
          control={<Checkbox 
          onChange={handleChangeEliptical}
          />}
          labelPlacement="top"
        />
      </FormGroup>
    </FormControl>
</div>


<div>
  <Button variant="contained" onClick={sendToBE}>Calculate</Button>
</div>

</div>

<div className='split right'>

    <Plot
      data={[graph1data,graph2data]}
      layout={ {width: null, height: null, title: 'Wykres Cz(alpha)'} }
    />


    <Plot
        data={[graph3data,graph4data]}
        layout={ {width: null, height: null, title: 'Wykres Cx(Cz)'} }
      />

</div>
  </div>
  )
}

export default App
