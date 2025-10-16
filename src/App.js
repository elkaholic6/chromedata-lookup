import React, { useState } from "react";
import {
	HashRouter as Router,
	Routes,
	Route,
	Link,
	useNavigate,
} from "react-router-dom";
import Styles from "./components/Styles";
import HomePage from "./components/Home";
import { loggerWebhook } from "./hooks/sheetsWebhook";
import "./App.css";

function App() {
	const sharedSecret =
		"8966ee5a739494e35a91fc1b342f4ee3ca6585e303b08f866ea33370ef3ffa20";

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
		return (
			`Atmosphere realm="https://partifyusa.com/",` +
			`chromedata_app_id="autodata-f0faaXigC4TsiISLYQPriMzlSRhDmN0OrueTqGsM",` +
			`chromedata_nonce="${nonce}",` +
			`chromedata_secret_digest="${secretDigest}",` +
			`chromedata_signature_method="SHA1",` +
			`chromedata_timestamp="${timestamp}"`
		);
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

	async function fetchVehicleDataForAllData(year, makeCode, model) {
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

			if (!styleData) {
				throw new Error("Invalid or empty response data");
			}

			// Return the entire result object
			return styleData;
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
			console.log("data.result", data.result);
			let codeArr = [];
			// let descriptionArr = [];
			let year = "";
			let make = "";
			let model = "";

			for (let i = 0; i < styleData.exteriorColors.length; i++) {
				if (year === "") {
					year = styleData.vehicles[i].year;
				}
				if (make === "") {
					make = styleData.vehicles[i].make;
				}
				if (model === "") {
					model = styleData.vehicles[i].model;
				}

				codeArr.push(
					styleData.exteriorColors[i].colorCode +
						" - " +
						styleData.exteriorColors[i].description
				);
				// descriptionArr.push(styleData.exteriorColors[i].description);
			}
			await loggerWebhook(styleId, year, make, model, codeArr.join(", "));
			return { year, make, model, codeArr };
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
			return { modelArr };
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
			return { makes };
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

	const propsForStyles = {
		generateAuthorizationToken,
		fetchVehicleDataWithStyleId,
	};

	return (
		<Router>
			<div className="App">
				<header className="App-header">
					<p className="version">Version 2.0</p>
					<nav className="nav-bar">
						<Link className="nav-button" to="/">
							Home
						</Link>
						<Link className="nav-button" to="/styles">
							Styles Lookup
						</Link>
					</nav>
					<Routes>
						<Route
							path="/"
							element={
								<HomePage
									year={year}
									setYear={setYear}
									makeCode={makeCode}
									setMakeCode={setMakeCode}
									model={model}
									setModel={setModel}
									handleSubmitYMM={handleSubmitYMM}
									vehicleDataYMM={vehicleDataYMM}
									yearModels={yearModels}
									setYearModels={setYearModels}
									makeCodeModels={makeCodeModels}
									setMakeCodeModels={setMakeCodeModels}
									handleSubmitModel={handleSubmitModel}
									vehicleModels={vehicleModels}
									yearMakeCodes={yearMakeCodes}
									setYearMakeCodes={setYearMakeCodes}
									handleSubmitYear={handleSubmitYear}
									vehicleMakeCodes={vehicleMakeCodes}
									styleId={styleId}
									setStyleId={setStyleId}
									vehicleDataStyleId={vehicleDataStyleId}
									handleSubmitStyleId={handleSubmitStyleId}
								/>
							}
						/>
						<Route
							path="/styles"
							element={
								<Styles
									fetchVehicleDataForAllData={fetchVehicleDataForAllData}
								/>
							}
						/>
					</Routes>
				</header>
			</div>
		</Router>
	);
}

export default App;
