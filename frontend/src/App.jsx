import { useState } from "react";
import "./App.css";
import axios from "axios";
import Plot from "react-plotly.js";
import BasicTabs from "./tabs";

const fileTypes = ["csv"];
let dataobj;

function App() {
  const [file, setFile] = useState(null);
  const [wings, setWings] = useState("composite-metal");
  const [eliptical, setEliptical] = useState(false);
  const [sepinput, setSepinput] = useState(",");
  const [decimalinput, setDecimalinput] = useState(".");
  const [wingspaninput, setWingspaninput] = useState(15.87);
  const [crinput, setCrinput] = useState(1.9);
  const [ctinput, setCtinput] = useState(1.9);
  const [macinput, setMacinput] = useState(1.9);
  const [massinput, setMassinput] = useState(2650);
  const [wingsurfaceinput, setWingsurfaceinput] = useState(30.15);
  const [b25input, setB25input] = useState(0);
  const [graph1data, setGraph1data] = useState({
    x: null,
    y: null,
    name: null,
  });

  const [graph2data, setGraph2data] = useState({
    x: null,
    y: null,
    name: null,
  });

  const [graph3data, setGraph3data] = useState({
    x: null,
    y: null,
    name: null,
  });

  const [graph4data, setGraph4data] = useState({
    x: null,
    y: null,
    name: null,
  });

  function getBase64(file) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      dataobj = reader.result.split(",")[1];
      console.log(dataobj);
      {
        /* Tutaj deklaracja zmienny odczytanych z text fieldów*/
      }
      let filename = file.name.split(".")[0];
      let filetype = file.name.split(".")[1];
      {
        /* Tutaj wysłanie zapytania do backendu z odczytanymi zmiennymi */
      }
      axios.post("http://127.0.0.1:8000/getFile", {
        data: dataobj,
        name: filename,
        type: filetype,
        sep: sepinput,
        decimal: decimalinput,
        wingspan: wingspaninput,
        wingsurface: wingsurfaceinput,
        mass: massinput,
        MAC: macinput,
        Wings: wings,
        Cr: crinput,
        Ct: ctinput,
        b25: b25input,
        iseliptical: eliptical,
      });
      axios
        .get("http://localhost:8000/data")
        .then(function (response) {
          setGraph1data({
            x: response.data.x_graph1,
            y: response.data.y_graph1,
            name: response.data.name1,
          });
          setGraph2data({
            x: response.data.x_graph2,
            y: response.data.y_graph2,
            name: response.data.name2,
          });
          setGraph3data({
            x: response.data.x_graph3,
            y: response.data.y_graph3,
            name: response.data.name3,
          });
          setGraph4data({
            x: response.data.x_graph4,
            y: response.data.y_graph4,
            name: response.data.name4,
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  }

  function sendToBE() {
    getBase64(file);
    console.log(sepinput);
    console.log(decimalinput);
    console.log(wingspaninput);
    console.log(crinput);
    console.log(ctinput);
    console.log(wings);
    console.log(eliptical);
  }

  return (
    <div className="App">
      <div className="split left">
        <BasicTabs
          chuj={setFile}
          setSepinput={setSepinput}
          sepinput={sepinput}
          decimalinput={decimalinput}
          setDecimalinput={setDecimalinput}
          wingspaninput={wingspaninput}
          setWingspaninput={setWingspaninput}
          crinput={crinput}
          ctinput={ctinput}
          setCrinput={setCrinput}
          setCtinput={setCtinput}
          macinput={macinput}
          massinput={massinput}
          setMacinput={setMacinput}
          setMassinput={setMassinput}
          wingsurfaceinput={wingsurfaceinput}
          b25input={b25input}
          setWingsurfaceinput={setWingsurfaceinput}
          setB25input={setB25input}
          sendToBE={sendToBE}
          setWings={setWings}
          wings={wings}
          eliptical={eliptical}
          setEliptical={setEliptical}
        />
      </div>

      <div className="split right">
        <Plot
          data={[graph1data, graph2data]}
          layout={{
            width: null,
            height: null,
            title: "Wykres Cz(alpha)",
            xaxis: { title: "alpha[deg]" },
            yaxis: { title: "Cz[-]" },
          }}
        />

        <Plot
          data={[graph3data, graph4data]}
          layout={{
            width: null,
            height: null,
            title: "Wykres Cx(Cz)",
            xaxis: { title: "Cz[-]" },
            yaxis: { title: "Cx[-]" },
          }}
        />
      </div>
    </div>
  );
}

export default App;
