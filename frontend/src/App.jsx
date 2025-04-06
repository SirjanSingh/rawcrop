import { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";
import FileCrop from "@/components/ui/filecrop";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);

  const clearAllData = async () => {
    if (!window.confirm("Are you sure you want to delete all files?")) return;

    const response = await fetch("http://localhost:8000/clear-data", {
      method: "DELETE",
    });

    const data = await response.json();
    alert(data.message);

    setFiles([]);
  };

  return (
    <div>

      {/* ✅ Clear Data Button */}
      <button
        onClick={clearAllData}
        className="ml-[1000px] top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
      >
        Clear Data
      </button>

      <div className="relative flex flex-col items-center  justify-center  min-h-screen gap-6 p-6 mt-10">

        <h1 className="text-3xl font-bold">Upload your files here</h1>

        <FileUpload files={files} setFiles={setFiles} />
        <FileCrop imageSrc="https://placehold.co/600x400/EEE/31343C"  />
      </div>
    </div>
  );
}

export default App;
