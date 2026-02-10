import os
import pickle
import joblib
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
#  Load Models Directly (Supporting both .json and .pkl)
# ---------------------------------------------------------
MODEL_FILENAME_JSON = 'xgb_model.json'
MODEL_FILENAME_PKL = 'aqi_model.pkl'

model = None

try:
    # Try loading JSON first (as per previous logs)
    if os.path.exists(MODEL_FILENAME_JSON):
        with open(MODEL_FILENAME_JSON, "rb") as f:
            model = pickle.load(f)
        print(f"Model Loaded Successfully from {MODEL_FILENAME_JSON}!")
    # Fallback to PKL if JSON missing
    elif os.path.exists(MODEL_FILENAME_PKL):
        model = joblib.load(MODEL_FILENAME_PKL)
        print(f"Model Loaded Successfully from {MODEL_FILENAME_PKL}!")
    else:
        print("Error: No model file found! Check Git LFS setup.")

except Exception as e:
    print(f"Critical Error loading model: {e}")
    model = None

# Define Input Structure
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
# Expanded City Coordinates
# ---------------------------------------------------------
CITY_COORDS = {
    "Delhi": {"lat": 28.6139, "lon": 77.2090},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Kolkata": {"lat": 22.5726, "lon": 88.3639},
    "Chennai": {"lat": 13.0827, "lon": 80.2707},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "Hyderabad": {"lat": 17.3850, "lon": 78.4867},
    "Ahmedabad": {"lat": 23.0225, "lon": 72.5714},
    "Pune": {"lat": 18.5204, "lon": 73.8567},
    "Jaipur": {"lat": 26.9124, "lon": 75.7873},
    "Lucknow": {"lat": 26.8467, "lon": 80.9462},
    "Patna": {"lat": 25.5941, "lon": 85.1376},
    "Chandigarh": {"lat": 30.7333, "lon": 76.7794},
    "Guwahati": {"lat": 26.1445, "lon": 91.7362},
    "Bhopal": {"lat": 23.2599, "lon": 77.4126},
    "Thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366},
    "Visakhapatnam": {"lat": 17.6868, "lon": 83.2185}
}

@app.get("/")
def home():
    return {"message": "AirLytics Backend is Live & Running!"}

# Endpoint: Get Live Temperature
@app.get("/weather/{state_name}")
def get_weather(state_name: str):
    city_key = None
    for key in CITY_COORDS:
        if key.lower() == state_name.lower():
            city_key = key
            break
    
    if not city_key:
        return {"error": f"Coordinates not found for {state_name}"}
    
    coords = CITY_COORDS[city_key]
    url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current_weather=true"
    
    try:
        response = requests.get(url, timeout=2)
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
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    try:
        # ---------------------------------------------------------
        # FIX: Matching features exactly with Model Training Data
        # ---------------------------------------------------------
        # The model was trained with: PM2.5, PM10, NO, NO2, NOx, NH3, CO, SO2, O3, Benzene, Toluene, Xylene
        # But NOT with Month or State_Code.
        
        features = pd.DataFrame([{
            'PM2.5': data.pm25,
            'PM10': data.pm10,
            'NO': 0.0,             # Missing feature filled with 0
            'NO2': data.no2,
            'NOx': 0.0,            # Missing feature filled with 0
            'NH3': 0.0,            # Missing feature filled with 0
            'CO': data.co,
            'SO2': data.so2,
            'O3': data.o3,
            'Benzene': 0.0,        # Missing feature filled with 0
            'Toluene': 0.0,        # Missing feature filled with 0
            'Xylene': 0.0          # Missing feature filled with 0
        }])
        
        # Predict
        prediction = model.predict(features)[0]
        
        # Status Logic
        aqi_val = float(prediction)
        status = "Good"
        if aqi_val > 50: status = "Satisfactory"
        if aqi_val > 100: status = "Moderate"
        if aqi_val > 200: status = "Poor"
        if aqi_val > 300: status = "Very Poor"
        if aqi_val > 400: status = "Severe"

        return {
            "predicted_aqi": round(aqi_val, 2),
            "air_quality_status": status,
            "input_city": data.state
        }
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)