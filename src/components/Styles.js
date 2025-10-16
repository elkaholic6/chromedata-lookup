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
			<h1>🚗 Vehicle Style Lookup</h1>
			<div className="form-container">
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
					<button type="submit" style={{ width: "318px" }}>
						Fetch Vehicle Data
					</button>
				</form>
			</div>
			{vehicleDataYMM &&
			Array.isArray(vehicleDataYMM.styles) &&
			vehicleDataYMM.styles.length > 0 ? (
				<div>
					<h2>Available Styles</h2>
					<div className="style-block-wrapper">
						{vehicleDataYMM.styles.map((style, idx) => (
							<div className="vehicle-style-card" key={style.styleId || idx}>
								<div className="vehicle-style-card-header">
									<span className="car-emoji">🚗</span>
									<span className="style-title">
										{style.year} {style.make} {style.model} {style.trim}
									</span>
								</div>
								<table className="ymm-table">
									<tbody>
										<tr>
											<th>Style ID</th>
											<td>{style.styleId}</td>
										</tr>
										<tr>
											<th>Year</th>
											<td>{style.year}</td>
										</tr>
										<tr>
											<th>Make</th>
											<td>{style.make}</td>
										</tr>
										<tr>
											<th>Model</th>
											<td>{style.model}</td>
										</tr>
										<tr>
											<th>Trim</th>
											<td>{style.trim}</td>
										</tr>
										<tr>
											<th>Description</th>
											<td>{style.styleDescription}</td>
										</tr>
										<tr>
											<th>Model ID</th>
											<td>{style.modelId}</td>
										</tr>
										{/* Add more fields as desired */}
									</tbody>
								</table>
							</div>
						))}
					</div>
				</div>
			) : (
				<p>No data available</p>
			)}
		</div>
	);
}

export default Styles;
