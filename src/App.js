import React, { useState } from "react";
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
    const apiUrl = `https://vss-api.jdpower.com/VSS/v1.0/styles?makeCode=${makeCode}&model=${model}&year=${year}`;

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

        if (!modelIds.includes(style.modelId)) {
          modelIds.push(style.modelId);
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
      return null;
    }
  }

  // React state management
  const [year, setYear] = useState("");
  const [makeCode, setMakeCode] = useState("");
  const [model, setModel] = useState("");
  const [vehicleData, setVehicleData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await fetchVehicleData(year, makeCode, model);

    setVehicleData(data.styleIds);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vehicle Lookup</h1>
        <form className="vehicle-form" onSubmit={handleSubmit}>
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
        {vehicleData ? (
          <div className="vehicle-data">
            <h2>Vehicle Data:</h2>
            <pre>{JSON.stringify(vehicleData, null, 2)}</pre>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </header>
    </div>
  );
}

export default App;
