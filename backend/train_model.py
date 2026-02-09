# train_model.py - Complete Training Script

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, accuracy_score
import joblib

# 1. Load Dataset
df = pd.read_csv('city_day.csv') 

print("Dataset Loaded. Shape:", df.shape)

# 2. Drop unnecessary columns
# City, Date, AQI_Bucket (Target for classification but we will predict it later)
# We keep 'City' temporarily to encode it if needed, but usually we use State. 
# Since your CSV has City, we will map City to State later or just encode City.
# Let's simplify and drop 'City', 'Date', 'AQI_Bucket' for regression training.
# We focus on predicting 'AQI'.

features = ['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene']
target = 'AQI'

# 3. Handle Missing Values
print("Handling missing values...")
# Drop rows where target (AQI) is missing
df = df.dropna(subset=[target])

# Fill missing features with Mean
imputer = SimpleImputer(strategy='mean')
df[features] = imputer.fit_transform(df[features])

# 4. Feature Engineering (Add State/City Encoding if needed)
# For simplicity, let's train on pollutants first as they are the main drivers.
# If you want to include 'City', we need to encode it.
encoder = LabelEncoder()
if 'City' in df.columns:
    df['City_Code'] = encoder.fit_transform(df['City'])
    features.append('City_Code')
    print("City Encoded.")
    
    # Save the encoder for backend use
    joblib.dump(encoder, 'state_encoder.pkl') 
    print("Encoder saved as 'state_encoder.pkl'")

X = df[features]
y = df[target]

# 5. Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training Regressor on {X_train.shape[0]} samples...")

# 6. Train Random Forest Regressor (For AQI Value)
regressor = RandomForestRegressor(n_estimators=100, random_state=42)
regressor.fit(X_train, y_train)

# Evaluate Regressor
y_pred = regressor.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Regressor MAE: {mae:.2f}")

# 7. Save the Model
joblib.dump(regressor, 'aqi_model.pkl')
print("Model saved as 'aqi_model.pkl'")

print("Training Complete! ")
print("Now move 'aqi_model.pkl' and 'state_encoder.pkl' to your backend folder.")