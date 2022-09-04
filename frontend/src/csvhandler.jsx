import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["csv"];
let dataobj;



export default function CsvHandler({dupa}) {
    const handleChange = (file) => {
        dupa(file);
      };
  return (
    <div>
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
    </div>
  );
}
