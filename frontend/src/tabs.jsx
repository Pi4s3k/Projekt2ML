import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CsvHandler from "./csvhandler";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import Slider from '@mui/material/Slider';
import { Document, Page } from 'react-pdf';



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({
  chuj,
  sepinput,
  setSepinput,
  decimalinput,
  setDecimalinput,
  wingspaninput,
  setWingspaninput,
  crinput,
  ctinput,
  setCtinput,
  setCrinput,
  macinput,
  massinput,
  setMacinput,
  setMassinput,
  wingsurfaceinput,
  b25input,
  setWingsurfaceinput,
  setB25input,
  sendToBE,
  eliptical,
  setEliptical,
  dragslider,
  setDragslider,
  setMindrag,
  mindrag
}) {
  const [value, setValue] = React.useState(0);
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);


  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const techdragcalc = (value,multiplier) =>{
    return value*multiplier;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="PLIK CSV" {...a11yProps(0)} />
          <Tab label="DANE" {...a11yProps(1)} />
          <Tab label="OPCJE SPECJALNE" {...a11yProps(2)} />
          <Tab label="Teoria" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <div>
          <h1>Plik CSV powinien zawierać kolumny cz, cx, alpha</h1>
        </div>
        <div className="FileBox">
          <CsvHandler dupa={chuj}></CsvHandler>
        </div>
        <div className="text">
          <TextField
            variant="standard"
            label="csv separator"
            value={sepinput}
            onChange={(event) => setSepinput(event.target.value)}
          />
          <TextField
            variant="standard"
            label="csv decimal"
            value={decimalinput}
            onChange={(event) => setDecimalinput(event.target.value)}
          />
        </div>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <div className="text">
          <TextField
            variant="standard"
            label="Wing span"
            value={wingspaninput}
            onChange={(event) => setWingspaninput(event.target.value)}
          />
          <TextField
            variant="standard"
            label="Wing surface"
            value={wingsurfaceinput}
            onChange={(event) => setWingsurfaceinput(event.target.value)}
          />
          <TextField
            variant="standard"
            label="Chord root"
            value={crinput}
            onChange={(event) => setCrinput(event.target.value)}
          />
          <TextField
            variant="standard"
            label="Chord tip"
            value={ctinput}
            onChange={(event) => setCtinput(event.target.value)}
          />
        </div>
        <div className="text">
          <TextField
            variant="standard"
            label="MAC"
            value={macinput}
            onChange={(event) => setMacinput(event.target.value)}
          />
          <TextField
            variant="standard"
            label="β25"
            value={b25input}
            onChange={(event) => setB25input(event.target.value)}
          />
          <TextField
            variant="standard"
            label="Mass"
            value={massinput}
            onChange={(event) => setMassinput(event.target.value)}
          />
        </div>
        <div>
        <h2>Cx_techn:{dragslider}*{mindrag}= {techdragcalc(mindrag,dragslider).toFixed(6)}</h2>
        <Slider
        value={dragslider}
        min={0}
        step={0.01}
        max={1}
        onChange={(event) =>{setDragslider(event.target.value);}}
        
        />
        </div>
        <div>
          <Button variant="contained" onClick={sendToBE}>
            Calculate
          </Button>
        </div>
        <div className='TekstWings'>
        <h3>Typowe wartości Cx_tech:</h3>
        -Skrzydła metalowe/kompozytowe: 0.15*Cx_min 
        <newline/>{'\n'}
        -Skrzydła drewniane 0.5*Cx_min:
        </div>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div className="text">
          <FormControl>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={eliptical}
                    onChange={(event) => setEliptical(event.target.checked)}
                  />
                }
                label="Skrzydło eliptyczne"
                labelPlacement="top"
              />
            </FormGroup>
          </FormControl>
        </div>
      </TabPanel>
      <TabPanel value={value} index={3}>
      <div>
      <Document file="E:\Projekt2ML\frontend\projekt.pdf" onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
      </TabPanel>
    </Box>
  );
}
