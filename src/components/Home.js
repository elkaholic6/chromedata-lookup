import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage({
	styleId,
	setStyleId,
	vehicleDataStyleId,
	handleSubmitStyleId,
	year,
	setYear,
	makeCode,
	setMakeCode,
	model,
	setModel,
	handleSubmitYMM,
	vehicleDataYMM,
	yearModels,
	setYearModels,
	makeCodeModels,
	setMakeCodeModels,
	handleSubmitModel,
	vehicleModels,
	yearMakeCodes,
	setYearMakeCodes,
	handleSubmitYear,
	vehicleMakeCodes,
}) {
	const navigate = useNavigate();

	return (
		<div>
			<h1>Vehicle Data Lookup</h1>
			{/* Form for vehicle style id */}
			<h2>Lookup by Style Id</h2>
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
						<h3>Vehicle Year:</h3>
						<pre>{JSON.stringify(vehicleDataStyleId.year, null, 2)}</pre>
					</div>
					<div className="vehicle-make">
						<h3>Vehicle Make:</h3>
						<pre>{JSON.stringify(vehicleDataStyleId.make, null, 2)}</pre>
					</div>
					<div className="vehicle-model">
						<h3>Vehicle Model:</h3>
						<pre>{JSON.stringify(vehicleDataStyleId.model, null, 2)}</pre>
					</div>
					<div className="vehicle-colors">
						<h3>Vehicle Colors:</h3>
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
					<h2>Lookup Make Codes:</h2>
					<pre>{JSON.stringify(vehicleMakeCodes, null, 2)}</pre>
				</div>
			) : (
				<p>No data available</p>
			)}
		</div>
	);
}

export default HomePage;
