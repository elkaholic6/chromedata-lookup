import React, { useState } from "react";
import { loggerWebhook } from "./hooks/sheetsWebhook";
import "./App.css";

function App() {
  const sharedSecret = "8966ee5a739494e35a91fc1b342f4ee3ca6585e303b08f866ea33370ef3ffa20";

  const generateNonce = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  async function generateSecretDigest(nonce, timestamp) {
    const sha1Input = nonce + timestamp + sharedSecret;
    const sha1 = new TextEncoder().encode(sha1Input);
    const hashBuffer = await crypto.subtle.digest("SHA-1", sha1);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const base64Hash = btoa(String.fromCharCode(...hashArray));
    return encodeURIComponent(base64Hash);
  }

  async function generateAuthorizationToken() {
    const nonce = generateNonce();
    const timestamp = Date.now().toString();
    const secretDigest = await generateSecretDigest(nonce, timestamp);
    return `Atmosphere realm="https://partifyusa.com/",` +
           `chromedata_app_id="autodata-f0faaXigC4TsiISLYQPriMzlSRhDmN0OrueTqGsM",` +
           `chromedata_nonce="${nonce}",` +
           `chromedata_secret_digest="${secretDigest}",` +
           `chromedata_signature_method="SHA1",` +
           `chromedata_timestamp="${timestamp}"`;
  }

  async function fetchVehicleData(year, makeCode, model) {
    const encodedModel = encodeURIComponent(model);
    const apiUrl = `https://vss-api.jdpower.com/VSS/v1.0/styles?makeCode=${makeCode}&model=${encodedModel}&year=${year}`;

    try {
      const authorizationToken = await generateAuthorizationToken();
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const styleData = data.result;

      if (!styleData || !styleData.styles) {
        throw new Error("Invalid or empty response data");
      }

      // Process the data
      let modelIds = [];
      let styleIds = "";
      let yearResult = "";
      let makeResult = "";
      let modelResult = "";

      for (let i = 0; i < styleData.styles.length; i++) {
        const style = styleData.styles[i];
        if (yearResult === "") {
          yearResult = style.year;
        }
        if (makeResult === "") {
          makeResult = style.make;
        }
        if (modelResult === "") {
          modelResult = style.model;
        }

          if (styleIds === "") {
            styleIds = style.styleId;
          } else {
            styleIds += `, ${style.styleId}`;
          }
      }

      return {
        styleIds,
      };

    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      return "failure";
    }
  }

  async function fetchVehicleDataWithStyleId(styleId) {
    const apiUrl = `https://vss-api.jdpower.com/VSS/v1.0/styleDetails?styleId=${styleId}`;
  
    try {
      const authorizationToken = await generateAuthorizationToken();
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const styleData = data.result;
      console.log('data.result', data.result);
      let codeArr = [];
      // let descriptionArr = [];
      let year = '';
      let make = '';
      let model = '';
  
      for (let i = 0; i < styleData.exteriorColors.length; i++) {
        if(year === '') {
          year = styleData.vehicles[i].year;
        }
        if(make === '') {
          make = styleData.vehicles[i].make;
        }
        if(model === '') {
          model = styleData.vehicles[i].model;
        }
        
        codeArr.push(styleData.exteriorColors[i].colorCode + ' - ' + styleData.exteriorColors[i].description);
        // descriptionArr.push(styleData.exteriorColors[i].description);
    }
      await loggerWebhook(styleId, year, make, model, codeArr.join(', '));
      return {year, make, model, codeArr};
  
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  }

  async function fetchVehicleModels(year, makeCode) {
    const apiUrl = `https://vss-api.jdpower.com/VSS/v1.0/models?makeCode=${makeCode}&year=${year}`;
  
    try {
      const authorizationToken = await generateAuthorizationToken();
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const models = data.result.models;
      let modelArr = [];
  
      for (let i = 0; i < models.length; i++) {
        modelArr.push(models[i].description);
        // descriptionArr.push(styleData.exteriorColors[i].description);
    }
      return {modelArr};
  
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  }

  async function fetchVehicleMakeCodes(year) {
    const apiUrl = `https://vss-api.jdpower.com/VSS/v1.0/makes?year=${year}`;
  
    try {
      const authorizationToken = await generateAuthorizationToken();
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: authorizationToken,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const makes = data.result.makes;
      return {makes};
  
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  }

  // React state management
  const [year, setYear] = useState("");
  const [makeCode, setMakeCode] = useState("");
  const [model, setModel] = useState("");
  const [styleId, setStyleId] = useState("");
  const [vehicleDataStyleId, setVehicleDataStyleID] = useState(null);
  const [vehicleDataYMM, setVehicleDataYMM] = useState(null);
  const [vehicleModels, setVehicleModels] = useState(null);
  const [vehicleMakeCodes, setVehicleMakeCodes] = useState(null);
  const [yearModels, setYearModels] = useState("");
  const [yearMakeCodes, setYearMakeCodes] = useState("");
  const [makeCodeModels, setMakeCodeModels] = useState("");


  const handleSubmitStyleId = async (e) => {
    e.preventDefault();

    setVehicleDataStyleID(null);
    const data = await fetchVehicleDataWithStyleId(styleId);

    // 137294

    setVehicleDataStyleID(data);
  };

  const handleSubmitYMM = async (e) => {
    e.preventDefault();

    setVehicleDataYMM(null);
    const data = await fetchVehicleData(year, makeCode, model);

    setVehicleDataYMM(data.styleIds);
  };

  const handleSubmitModel = async (e) => {
    e.preventDefault();

    setVehicleModels(null);
    const data = await fetchVehicleModels(yearModels, makeCodeModels);

    setVehicleModels(data.modelArr);
  };

  const handleSubmitYear = async (e) => {
    e.preventDefault();

    setVehicleMakeCodes(null);
    const data = await fetchVehicleMakeCodes(yearMakeCodes);

    setVehicleMakeCodes(data.makes);
  };

  return (
    <div className="App">
      <header className="App-header">
      <p className="version">Version 1.0</p>
        <h1>Lookup by Style Id</h1>
        {/* Form for vehicle style id */}
        <form className="vehicle-form" onSubmit={handleSubmitStyleId}>
          <input
            type="text"
            placeholder="Enter Style Id"
            value={styleId}
            onChange={(e) => setStyleId(e.target.value)}
            required
          />
          <button type="submit">Fetch Vehicle Data</button>
        </form>
        {vehicleDataStyleId ? (
          <>
            <div className="vehicle-year">
              <h2>Vehicle Year:</h2>
              <pre>{JSON.stringify(vehicleDataStyleId.year, null, 2)}</pre>
            </div>
            <div className="vehicle-make">
              <h2>Vehicle Make:</h2>
              <pre>{JSON.stringify(vehicleDataStyleId.make, null, 2)}</pre>
            </div>
            <div className="vehicle-model">
              <h2>Vehicle Model:</h2>
              <pre>{JSON.stringify(vehicleDataStyleId.model, null, 2)}</pre>
            </div>
            <div className="vehicle-colors">
              <h2>Vehicle Colors:</h2>
              <pre>{JSON.stringify(vehicleDataStyleId.codeArr, null, 2)}</pre>
            </div>
          </>
        ) : (
          <p>No data available</p>
        )}
        {/* Form for vehicle year, make, model */}
        <form className="vehicle-form-ymm" onSubmit={handleSubmitYMM}>
          <input
            type="text"
            placeholder="Enter Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Make Code"
            value={makeCode}
            onChange={(e) => setMakeCode(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
          <button type="submit">Fetch Vehicle Data</button>
        </form>
        {vehicleDataYMM ? (
          <div className="vehicle-data">
            <h2>Lookup by YMM:</h2>
            <pre>{JSON.stringify(vehicleDataYMM, null, 2)}</pre>
          </div>
        ) : (
          <p>No data available</p>
        )}
        {/* Form for models */}
        <form className="vehicle-form-models" onSubmit={handleSubmitModel}>
          <input
            type="text"
            placeholder="Enter Year"
            value={yearModels}
            onChange={(e) => setYearModels(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter Make Code"
            value={makeCodeModels}
            onChange={(e) => setMakeCodeModels(e.target.value)}
            required
          />
          <button type="submit">Fetch Vehicle Data</button>
        </form>
        {vehicleModels ? (
          <div className="vehicle-data">
            <h2>Lookup Models:</h2>
            <pre>{JSON.stringify(vehicleModels, null, 2)}</pre>
          </div>
        ) : (
          <p>No data available</p>
        )}
        {/* Form for finding make codes */}
        <form className="vehicle-form-make-codes" onSubmit={handleSubmitYear}>
          <input
            type="text"
            placeholder="Enter Year"
            value={yearMakeCodes}
            onChange={(e) => setYearMakeCodes(e.target.value)}
            required
          />
          <button type="submit">Fetch Vehicle Data</button>
        </form>
        {vehicleMakeCodes ? (
          <div className="vehicle-data">
            <h2>Lookup Models:</h2>
            <pre>{JSON.stringify(vehicleMakeCodes, null, 2)}</pre>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </header>
    </div>
  );
}

export default App;
