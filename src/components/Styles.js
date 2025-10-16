import React, { useState } from "react";

function Styles({ fetchVehicleDataForAllData }) {
	const [year, setYear] = useState("");
	const [makeCode, setMakeCode] = useState("");
	const [model, setModel] = useState("");
	const [vehicleDataYMM, setVehicleDataYMM] = useState(null);

	const handleSubmitYMM = async (e) => {
		e.preventDefault();

		setVehicleDataYMM(null);
		const data = await fetchVehicleDataForAllData(year, makeCode, model);
		console.log("data:", data);

		setVehicleDataYMM(data);
	};

	return (
		<div>
			<h1>Lookup by Year, Make Code, and Model</h1>
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
			{vehicleDataYMM &&
			Array.isArray(vehicleDataYMM.styles) &&
			vehicleDataYMM.styles.length > 0 ? (
				<div>
					<h2>Lookup by YMM:</h2>
					{vehicleDataYMM.styles.map((style, idx) => (
						<div className="vehicle-data" key={style.styleId || idx}>
							<pre>{JSON.stringify(style, null, 2)}</pre>
						</div>
					))}
				</div>
			) : (
				<p>No data available</p>
			)}
		</div>
	);
}

export default Styles;
