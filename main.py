from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
from datetime import datetime
from pathlib import Path

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "weather_model.pkl"
LOCATION_PATH = BASE_DIR / "locationData.csv"
model = None
location = None

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_weather_assets():
    global model, location

    if model is None:
        with MODEL_PATH.open("rb") as model_file:
            model = pickle.load(model_file)

    if location is None:
        location = pd.read_csv(LOCATION_PATH)

    return model, location

@app.get("/api/predict")
@app.get("/predict")
def predict(city: str, date: str):
    model, location = get_weather_assets()

    # Find city coordinates and elevation
    loc = location[location["city_name"].str.lower() == city.lower()]
    
    if loc.empty:
        return {"error": "City not found"}
        
    lat = loc.iloc[0]["latitude"]
    lon = loc.iloc[0]["longitude"]
    elevation = loc.iloc[0]["elevation"]
    
    # Process date
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}
        
    month = date_obj.month
    dayofyear = date_obj.timetuple().tm_yday
    
    # Prepare features for prediction
    # Assuming columns: latitude, longitude, elevation, month, dayofyear
    X = pd.DataFrame([{
        "latitude": lat,
        "longitude": lon,
        "elevation": elevation,
        "month": month,
        "dayofyear": dayofyear
    }])
    
    prediction = model.predict(X)[0]
    temp, rain, wind = prediction
    
    # Simple sunrise/sunset approximation or dummy data
    sunrise = "06:15 AM"
    sunset = "06:45 PM"
    
    return {
        "city": city,
        "temperature_c": round(float(temp), 2),
        "rain_mm": round(float(rain), 2),
        "wind_kmh": round(float(wind), 2),
        "sunrise": sunrise,
        "sunset": sunset,
        "elevation_m": float(elevation)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
