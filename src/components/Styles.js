import React, { useState } from "react";

function Styles({
	fetchVehicleDataForAllData,
	fetchVehicleModelsAllData,
	fetchVehicleMakeCodesAllData,
}) {
	const [year, setYear] = useState("");
	const [makeCode, setMakeCode] = useState("");
	const [model, setModel] = useState("");
	const [vehicleDataYMM, setVehicleDataYMM] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setVehicleDataYMM(null);

		// Only year filled
		if (year && !makeCode && !model) {
			const data = await fetchVehicleMakeCodesAllData(year);
			setVehicleDataYMM(data);
		}
		// Year & makeCode filled, but not model
		else if (year && makeCode && !model) {
			const data = await fetchVehicleModelsAllData(year, makeCode);
			setVehicleDataYMM(data);
		}
		// All three filled
		else if (year && makeCode && model) {
			const data = await fetchVehicleDataForAllData(year, makeCode, model);
			setVehicleDataYMM(data);
		}
		// If no year or incomplete fields, you may want to handle this case (optional)
		else {
			setVehicleDataYMM(null); // Or set some error state/message
		}
	};

	return (
		<div>
			<h1>🚗 Vehicle Style Lookup</h1>
			<div className="form-container">
				<form className="vehicle-form-ymm" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Enter Year"
						value={year}
						onChange={(e) => setYear(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Enter Make Code"
						value={makeCode}
						onChange={(e) => setMakeCode(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Enter Model"
						value={model}
						onChange={(e) => setModel(e.target.value)}
					/>
					<button type="submit" style={{ width: "318px" }}>
						Fetch Vehicle Data
					</button>
				</form>
			</div>
			{/* Styles returned */}
			{vehicleDataYMM &&
			Array.isArray(vehicleDataYMM.styles) &&
			vehicleDataYMM.styles.length > 0 ? (
				<div>
					<h2>Available Styles</h2>
					<div className="style-block-wrapper">
						{vehicleDataYMM.styles.map((style, idx) => (
							<div className="vehicle-style-card" key={idx}>
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
									</tbody>
								</table>
							</div>
						))}
					</div>
				</div>
			) : /* Makes returned */
			vehicleDataYMM &&
			  Array.isArray(vehicleDataYMM.makes) &&
			  vehicleDataYMM.makes.length > 0 ? (
				<div>
					<h2>Available Makes</h2>
					<div className="style-block-wrapper">
						{vehicleDataYMM.makes.map((make, idx) => (
							<div className="vehicle-style-card" key={idx}>
								<div className="vehicle-style-card-header">
									<span className="car-emoji">🚗</span>
									<span className="style-title">
										{make.make} ({make.makeCode})
									</span>
								</div>
								<table className="ymm-table">
									<tbody>
										<tr>
											<th>Make</th>
											<td>{make.make}</td>
										</tr>
										<tr>
											<th>Make Code</th>
											<td>{make.makeCode}</td>
										</tr>
									</tbody>
								</table>
							</div>
						))}
					</div>
				</div>
			) : /* Models returned */
			vehicleDataYMM &&
			  Array.isArray(vehicleDataYMM.models) &&
			  vehicleDataYMM.models.length > 0 ? (
				<div>
					<h2>Available Models</h2>
					<div className="style-block-wrapper">
						{vehicleDataYMM.models.map((model, idx) => (
							<div className="vehicle-style-card" key={idx}>
								<div className="vehicle-style-card-header">
									<span className="car-emoji">🚗</span>
									<span className="style-title">{model.description}</span>
								</div>
								<table className="ymm-table">
									<tbody>
										<tr>
											<th>Description</th>
											<td>{model.description}</td>
										</tr>
										<tr>
											<th>Make Code</th>
											<td>{model.makeCode}</td>
										</tr>
										<tr>
											<th>Model Year ID</th>
											<td>{model.modelYearId}</td>
										</tr>
										<tr>
											<th>Year</th>
											<td>{model.year}</td>
										</tr>
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
