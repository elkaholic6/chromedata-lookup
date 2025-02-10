export const loggerWebhook = async (styleId, year, make, model, colors) => {
    // const googleSheetsUrl = import.meta.env.VITE_SHEETS_LOGGER;
    // const googleSheetsUrl = import.meta.env.VITE_DEV_GOOGLE_SHEETS;
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxMtm43s8QCWRpJRJaKvL0hcvvA551DEYb4cVq0EHRZlygV0nzdPKveWfAbJh3E6OWs/exec', {
            redirect: "follow",
            method: "POST",
            headers: {
            "Content-Type": "text/plain;charset=UTF-8",
            },
            body: JSON.stringify({ 
                styleId: styleId,
                year: year,
                make: make,
                model: model,
                colors: colors
            }),
        });
        
        // If the response is not JSON, log it as text to debug
        const text = await response.text();    
        // Try parsing the JSON only if the response status is OK
        if (response.ok) {
            const result = JSON.parse(text);
            return result;
        } else {
            console.error('Server responded with an error:', text);
        }
    } catch(error) {
    console.error("Error submitting logs:", error);
    }
}
