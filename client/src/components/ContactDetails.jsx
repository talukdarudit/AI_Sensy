import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import * as xlsx from "xlsx";
import { toast } from "react-toastify";
import Papa from "papaparse";

const limits = [5, 10, 15, 20, 25, 30];

function validateFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target.result;

      try {
        // if (file.name.endsWith(".csv")) {
        //   Papa.parse(content, {
        //     header: true,
        //     skipEmptyLines: true,
        //     complete: (result) => {
        //       const parsedData = result.data;
        //       const requiredColumns = ["Name", "Email", "Mobile Number"];
        //       const fileColumns = Object.keys(parsedData[0]);
        //       const missingColumns = requiredColumns.filter(
        //         (col) => !fileColumns.includes(col)
        //       );
        //       if (missingColumns.length > 0) {
        //         reject(
        //           `Missing required columns: ${missingColumns.join(", ")}`
        //         );
        //       } else {
        //         resolve(parsedData);
        //       }
        //     },
        //     error: (error) => {
        //       reject("Error parsing CSV file");
        //     },
        //   });
        // } else

        if (file.name.endsWith(".xlsx")) {
          const workbook = xlsx.read(content, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonContent = xlsx.utils.sheet_to_json(sheet);

          const requiredColumns = ["Name", "Email", "Mobile Number"];
          const fileColumns = Object.keys(jsonContent[0]);
          const missingColumns = requiredColumns.filter(
            (col) => !fileColumns.includes(col)
          );

          if (missingColumns.length > 0) {
            reject(`Missing required columns: ${missingColumns.join(", ")}`);
          } else {
            resolve(null);
          }
        } else {
          reject("Unsupported file type");
        }
      } catch (error) {
        toast.error("Inavlid format");
        reject(error.message);
      }
    };

    reader.onerror = () => {
      reject("Error reading file");
    };

    reader.readAsArrayBuffer(file);
  });
}

function ContactDetails() {
  const [csvFile, setCsvFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [validationError, setValidationError] = useState(null);

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      //   try {
      // await validateFile(file);
      // setValidationError(null);
      setCsvFile(file);
      //   } catch (error) {
      //     setValidationError(error);
      //   }
    } else {
      setCsvFile(null);
    }
  };

  const fetchContact = async (page) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/users/getcontacts?page=${page}&limit=${limit}`
      );
      setContacts(response.data);
      console.log(response.data);
    } catch (error) {
      console.log("error");
    }
  };
  useEffect(() => {
    fetchContact(currentPage);
  }, [currentPage, csvFile, limit]);

  const uploadCsvFile = async () => {
    if (!csvFile) {
      return;
    }

    const formData = new FormData();
    formData.append("contactsFile", csvFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload successful:", response.data);
      setCsvFile(null);
    } catch (error) {
      console.error("Error uploading CSV file:", error);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setLimit(newLimit);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-8">
  <div className="space-x-2 flex items-center">
    <input
      type="file"
      accept=".csv, .xls, .xlsx"
      onChange={handleCsvFileChange}
      className="hidden"
      id="fileInput"
    />
    <label
      htmlFor="fileInput"
      className="cursor-pointer p-1 md:p-2 mt-2 md:mt-4 bg-blue-500 text-white hover:bg-blue-400 rounded-md shadow-md"
    >
      Upload Contacts
    </label>
    {csvFile && (
      <div className="flex flex-col items-center">
        <p>Selected file: {csvFile.name}</p>
        <button
          className="text-white font-semibold bg-green-500 border-2 px-2 border-dashed border-green-600 rounded-md shadow-md"
          onClick={uploadCsvFile}
        >
          Upload Contact
        </button>
      </div>
    )}
  </div>
  

  <div className="w-full mx-2 md:mx-0 text-sm md:text-lg md:w-3/4 pb-4 max-h-[300px] md:max-h-[450px] overflow-y-auto">
  <div className="w-full flex flex-col items-center space-y-4">
    <div className="sticky top-0 w-full">
      <table className="w-full bg-white border-collapse border border-gray-200 rounded-md shadow-md">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="p-3 border-b border-gray-200">Name</th>
            <th className="p-3 border-b border-gray-200">Email</th>
            <th className="p-3 border-b border-gray-200">Mobile Number</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white hover:bg-gray-100"}>
              <td className="p-3 border-b border-gray-200">{contact?.name}</td>
              <td className="p-3 border-b border-gray-200">{contact?.email}</td>
              <td className="p-3 border-b border-gray-200">{contact?.mobileNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  <div className="flex justify-center mt-4 w-3/4 ">
    <div className="w-full flex justify-between">
      <button
        disabled={currentPage === 1}
        className={
          currentPage === 1
            ? "bg-gray-400 text-white p-1 md:p-3 rounded-md shadow-md"
            : "bg-blue-500 text-white p-1 md:p-3 rounded-md shadow-md hover:bg-blue-400"
        }
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>
      <div>
        <label htmlFor="limitSelect">Number of entries/page:</label>
        <select
          id="limitSelect"
          className="outline-none rounded-md shadow-md"
          value={limit}
          onChange={handleLimitChange}
        >
          {limits.map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </select>
      </div>

      <button
        className={
          false
            ? "bg-gray-400 text-white p-1 md:p-3 rounded-md shadow-md"
            : "bg-blue-500 text-white p-1 md:p-3 rounded-md shadow-md hover:bg-blue-400"
        }
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
</div>

  );
}

export default ContactDetails;
