import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import requests

# Initialize App
app = FastAPI(title="AirLytics API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
#  Load Models Directly (Using Git LFS)
# ---------------------------------------------------------
MODEL_FILENAME = 'aqi_model.pkl'
ENCODER_FILENAME = 'state_encoder.pkl'

try:
    # Directly load from disk (Git LFS makes sure they are here)
    if os.path.exists(MODEL_FILENAME):
        model = joblib.load(MODEL_FILENAME)
        print("Model Loaded Successfully from Disk!")
    else:
        print(f"Error: {MODEL_FILENAME} not found! Check Git LFS setup.")
        model = None

    if os.path.exists(ENCODER_FILENAME):
        encoder = joblib.load(ENCODER_FILENAME)
        print("Encoder Loaded Successfully!")
    else:
        print(f"Warning: {ENCODER_FILENAME} not found!")
        encoder = None

except Exception as e:
    print(f"Critical Error loading model: {e}")
    model, encoder = None, None

#  Define Input Structure
class AQIRequest(BaseModel):
    state: str
    month: int
    pm25: float
    pm10: float
    no2: float
    co: float
    so2: float
    o3: float

# ---------------------------------------------------------
# Expanded City Coordinates (All cities from CSV)
# ---------------------------------------------------------
CITY_COORDS = {
    # Existing
    "Delhi": {"lat": 28.6139, "lon": 77.2090},
    "Maharashtra": {"lat": 19.0760, "lon": 72.8777}, # Mapped to Mumbai
    "West Bengal": {"lat": 22.5726, "lon": 88.3639}, # Mapped to Kolkata
    "Tamil Nadu": {"lat": 13.0827, "lon": 80.2707},  # Mapped to Chennai
    "Karnataka": {"lat": 12.9716, "lon": 77.5946},   # Mapped to Bengaluru
    
    # Added from CSV
    "Ahmedabad": {"lat": 23.0225, "lon": 72.5714},
    "Aizawl": {"lat": 23.7307, "lon": 92.7173},
    "Amaravati": {"lat": 16.573, "lon": 80.3575},
    "Amritsar": {"lat": 31.6340, "lon": 74.8723},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "Bhopal": {"lat": 23.2599, "lon": 77.4126},
    "Brajrajnagar": {"lat": 21.82, "lon": 83.92},
    "Chandigarh": {"lat": 30.7333, "lon": 76.7794},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
    "Coimbatore": {"lat": 11.0168, "lon": 76.9558},
    "Ernakulam": {"lat": 9.9816, "lon": 76.2999},
    "Gurugram": {"lat": 28.4595, "lon": 77.0266},
    "Guwahati": {"lat": 26.1445, "lon": 91.7362},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Jaipur": {"lat": 26.9124, "lon": 75.7873},
    "Jorapokhar": {"lat": 23.70, "lon": 86.41},
    "Kochi": {"lat": 9.9312, "lon": 76.2673},
    "Kolkata": {"lat": 22.5726, "lon": 88.3639},
    "Lucknow": {"lat": 26.8467, "lon": 80.9462},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Patna": {"lat": 25.5941, "lon": 85.1376},
    "Shillong": {"lat": 25.5788, "lon": 91.8933},
    "Talcher": {"lat": 20.95, "lon": 85.23},
    "Thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366},
    "Visakhapatnam": {"lat": 17.6868, "lon": 83.2185}
}

# Endpoint: Get Live Temperature
@app.get("/weather/{state_name}")
def get_weather(state_name: str):
    # Case insensitive search fix
    city_key = None
    for key in CITY_COORDS:
        if key.lower() == state_name.lower():
            city_key = key
            break
    
    if not city_key:
        return {"error": f"Coordinates not found for {state_name}"}
    
    coords = CITY_COORDS[city_key]
    
    # Fetching from Open-Meteo
    url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current_weather=true"
    
    try:
        response = requests.get(url, timeout=2) # Fast timeout
        if response.status_code == 200:
            data = response.json()
            temp = data.get('current_weather', {}).get('temperature', 'N/A')
            return {"temperature": temp}
        else:
            return {"error": "Weather API failed"}
    except Exception as e:
        return {"error": str(e)}

# Endpoint: Predict AQI
@app.post("/predict")
def predict_aqi(data: AQIRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model missing. Git LFS issue?")

    try:
        # Encode State
        state_code = 0
        if encoder:
            try:
                state_code = encoder.transform([data.state])[0]
            except:
                state_code = 0 
        
        # Prepare Features
        features = pd.DataFrame([{
            'State_Code': state_code,
            'Month': data.month,
            'PM2.5': data.pm25,
            'PM10': data.pm10,
            'NO2': data.no2,
            'CO': data.co,
            'SO2': data.so2,
            'O3': data.o3
        }])
        
        # Predict
        prediction = model.predict(features)[0]
        
        # Status Logic
        status = "Good"
        if prediction > 50: status = "Satisfactory"
        if prediction > 100: status = "Moderate"
        if prediction > 200: status = "Poor"
        if prediction > 300: status = "Very Poor"
        if prediction > 400: status = "Severe"

        return {
            "predicted_aqi": round(float(prediction), 2),
            "air_quality_status": status,
            "input_city": data.state
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)