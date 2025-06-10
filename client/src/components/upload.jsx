import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import bgimg from "../images/bgimg.jpeg"; // ✅ Import Background Image

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("✅ File uploaded successfully!");
      } else {
        alert("❌ Failed to upload file.");
      }
    } catch (error) {
      alert("❌ Error uploading file.");
    }
  };

  return (
    <div
      className="h-screen w-full flex justify-center items-center bg-cover bg-center font-poppins"
      style={{ backgroundImage: `url(${bgimg})` }} // ✅ Apply Background Image
    >
      <div className="p-8 shadow-lg rounded-lg w-96 text-center border border-gray-300 bg-white bg-opacity-90">
        <h2 className="text-2xl font-bold text-black mb-4">📂 Upload File</h2>

        <label className="w-full p-6 bg-yellowCustom text-black font-medium rounded-lg cursor-pointer flex flex-col items-center justify-center border border-black">
          <FaCloudUploadAlt size={40} className="mb-2" />
          <span>Click to upload CSV or Excel</span>
          <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileChange} />
        </label>

        {selectedFile && (
          <p className="mt-2 text-sm text-black">Selected: {selectedFile.name}</p>
        )}

        <button 
          onClick={handleUpload}
          className="mt-4 w-full bg-greenCustom text-white py-2 rounded-lg hover:bg-green-700 transition-all duration-300"
        >
          Upload File
        </button>
      </div>
    </div>
  );
};

export default Upload;
