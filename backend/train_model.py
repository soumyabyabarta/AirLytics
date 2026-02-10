import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor
import joblib

# 1. Load Dataset
# Ensure 'city_day.csv' is in the same folder as this script
try:
    df = pd.read_csv('city_day.csv')
    print(f"Dataset Loaded. Original Shape: {df.shape}")
except FileNotFoundError:
    print("Error: 'city_day.csv' not found. Please place the CSV in this folder.")
    exit()

# 2. Select ONLY the features used in your Frontend/App
# Training on extra features (like Benzene) makes the model inaccurate 
# when the app sends 0 for them.
features = ['PM2.5', 'PM10', 'NO2', 'CO', 'SO2', 'O3']
target = 'AQI'

# 3. Clean Data
# Drop rows where target (AQI) or any of our 6 features are missing
# For 90%+ accuracy, high-quality clean data is better than imputed data.
df_clean = df.dropna(subset=features + [target])
print(f"Data cleaned. Training on {len(df_clean)} high-quality samples.")

X = df_clean[features]
y = df_clean[target]

# 4. Split Data (80% Train, 20% Test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Train XGBoost Regressor
# Hyperparameters tuned for high accuracy
model = XGBRegressor(
    n_estimators=300,
    learning_rate=0.05,
    max_depth=8,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

print("Training XGBoost Model... This may take a moment.")
model.fit(X_train, y_train)

# 6. Evaluate Performance
y_pred = model.predict(X_test)
accuracy = r2_score(y_test, y_pred) * 100
mae = mean_absolute_error(y_test, y_pred)

print("\n" + "="*30)
print(f"MODEL ACCURACY: {accuracy:.2f}%")
print(f"MEAN ABSOLUTE ERROR: {mae:.2f}")
print("="*30 + "\n")

# 7. Save the Model
# We save it as 'aqi_model.pkl' to match your existing backend logic
joblib.dump(model, 'aqi_model.pkl')
print("Final Model saved as 'aqi_model.pkl'")
print("Success! Now move 'aqi_model.pkl' to your /backend folder.")