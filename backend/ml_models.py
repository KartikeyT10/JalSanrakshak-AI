import os
import pickle
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import joblib
from sklearn.preprocessing import LabelEncoder
import json

class MLModelService:
    def __init__(self):
        self.runoff_model = None
        self.structure_model = None
        self.harvest_model = None
        self.cost_model = None
        self.label_encoders = {}
        self.scalers = {}
        self.models_loaded = False
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.load_models()
        self._ensure_encoders()

    def _resolve_path(self, filename: str) -> str:
        local_path = os.path.join(self.base_dir, filename)
        if os.path.exists(local_path):
            return local_path
        return filename

    def _safe_load_joblib(self, filename: str):
        path = self._resolve_path(filename)
        if not os.path.exists(path):
            return None
        try:
            # Check if it's a git lfs pointer file
            with open(path, 'rb') as f:
                header = f.read(40)
                if b'version https://git-lfs' in header:
                    return None
            return joblib.load(path)
        except Exception as e:
            print(f"Warning: could not load {filename}: {e}")
            return None

    def _ensure_encoders(self):
        """Ensure fallback label encoders are initialized for categorical features."""
        if 'roof_type' not in self.label_encoders or self.label_encoders['roof_type'] is None:
            le = LabelEncoder()
            le.fit(['concrete', 'tiled', 'metal', 'asbestos', 'thatched', 'plastic',
                    'Concrete', 'Tiled', 'Metal', 'Asbestos', 'Thatched', 'Plastic'])
            self.label_encoders['roof_type'] = le

        if 'soil_type' not in self.label_encoders or self.label_encoders['soil_type'] is None:
            le = LabelEncoder()
            le.fit(['Sandy', 'Clay', 'Loam', 'Silt', 'Sandy Loam', 'Clayey', 'Alluvial', 'Black Cotton', 'Red Soil', 'Laterite',
                    'sandy', 'clay', 'loam', 'silt', 'sandy loam', 'clayey', 'alluvial', 'black cotton', 'red soil', 'laterite'])
            self.label_encoders['soil_type'] = le

        if 'aquifer_type' not in self.label_encoders or self.label_encoders['aquifer_type'] is None:
            le = LabelEncoder()
            le.fit(['Alluvium', 'Sandstone', 'Basalt', 'Granite', 'Limestone', 'Shale', 'Laterite', 'Coastal Alluvium', 'Hard Rock',
                    'alluvium', 'sandstone', 'basalt', 'granite', 'limestone', 'shale', 'laterite', 'coastal alluvium', 'hard rock'])
            self.label_encoders['aquifer_type'] = le

        if 'recommended_structure' not in self.label_encoders or self.label_encoders['recommended_structure'] is None:
            le = LabelEncoder()
            le.fit(['Storage_Tank', 'Recharge_Pit', 'Recharge_Trench', 'Recharge_Shaft'])
            self.label_encoders['recommended_structure'] = le

    def load_models(self):
        """Load trained ML models safely"""
        try:
            self.runoff_model = self._safe_load_joblib('runoff_model.pkl')
            self.label_encoders['roof_type'] = self._safe_load_joblib('roof_type_encoder.pkl')

            self.structure_model = self._safe_load_joblib('structure_model.pkl')
            self.label_encoders['soil_type'] = self._safe_load_joblib('soil_type_encoder.pkl')
            self.label_encoders['aquifer_type'] = self._safe_load_joblib('aquifer_type_encoder.pkl')

            self.harvest_model = self._safe_load_joblib('harvest_model.pkl')

            self.cost_model = self._safe_load_joblib('cost_model.pkl')
            self.label_encoders['recommended_structure'] = self._safe_load_joblib('structure_encoder.pkl')

            self.models_loaded = True
        except Exception as e:
            print(f"ML models loading notice: {e}. Using rule-based fallback.")
            self.models_loaded = False
    
    def predict_runoff_coefficient(self, roof_type: str, roof_age: int, region: str = "urban"):
        """Predict runoff coefficient"""
        try:
            if self.runoff_model and 'roof_type' in self.label_encoders and self.label_encoders['roof_type']:
                try:
                    roof_type_encoded = self.label_encoders['roof_type'].transform([roof_type])[0]
                except Exception:
                    roof_type_encoded = 0
                features = np.array([[roof_type_encoded, roof_age, 1 if region.lower() == "urban" else 0]])
                runoff_coeff = float(self.runoff_model.predict(features)[0])
                return max(0.3, min(0.95, runoff_coeff))
            else:
                return self._fallback_runoff_coefficient(roof_type, roof_age)
        except Exception as e:
            print(f"Runoff prediction error: {e}")
            return self._fallback_runoff_coefficient(roof_type, roof_age)
    
    def predict_structure(self, roof_area: float, open_space: float, 
                         soil_type: str, aquifer_type: str, water_depth: float):
        """Recommend RWH structure"""
        try:
            if (self.structure_model and 
                'soil_type' in self.label_encoders and self.label_encoders['soil_type'] and 
                'aquifer_type' in self.label_encoders and self.label_encoders['aquifer_type']):
                try:
                    soil_encoded = self.label_encoders['soil_type'].transform([soil_type])[0]
                except Exception:
                    soil_encoded = 0
                try:
                    aquifer_encoded = self.label_encoders['aquifer_type'].transform([aquifer_type])[0]
                except Exception:
                    aquifer_encoded = 0
                features = np.array([[roof_area, open_space, soil_encoded, aquifer_encoded, water_depth]])
                structure_idx = int(self.structure_model.predict(features)[0])
                structures = ["Storage_Tank", "Recharge_Pit", "Recharge_Trench", "Recharge_Shaft"]
                if 0 <= structure_idx < len(structures):
                    return structures[structure_idx]
                return "Storage_Tank"
            else:
                return self._fallback_structure_recommendation(roof_area, open_space, soil_type, water_depth)
        except Exception as e:
            print(f"Structure prediction error: {e}")
            return self._fallback_structure_recommendation(roof_area, open_space, soil_type, water_depth)
    
    def predict_water_harvest(self, open_space: float, runoff_coeff: float, 
                             annual_rainfall: float, roof_type: str):
        """Predict harvestable water"""
        try:
            if self.harvest_model and 'roof_type' in self.label_encoders and self.label_encoders['roof_type']:
                try:
                    roof_type_encoded = self.label_encoders['roof_type'].transform([roof_type])[0]
                except Exception:
                    roof_type_encoded = 0
                features = np.array([[open_space, runoff_coeff, annual_rainfall, roof_type_encoded]])
                harvest = float(self.harvest_model.predict(features)[0])
                return max(0.0, harvest)
            else:
                return self._fallback_water_harvest(open_space, runoff_coeff, annual_rainfall)
        except Exception as e:
            print(f"Harvest prediction error: {e}")
            return self._fallback_water_harvest(open_space, runoff_coeff, annual_rainfall)
    
    def predict_cost_benefit(self, structure_type: str, roof_area: float, region: str = "urban"):
        """Predict costs and payback period"""
        try:
            if (self.cost_model and 
                'recommended_structure' in self.label_encoders and 
                self.label_encoders['recommended_structure']):
                try:
                    structure_encoded = self.label_encoders['recommended_structure'].transform([structure_type])[0]
                except Exception:
                    structure_encoded = 0
                region_encoded = 1 if region.lower() == "urban" else 0
                features = np.array([[structure_encoded, roof_area, region_encoded]])
                prediction = self.cost_model.predict(features)[0]
                return {
                    'installation_cost': float(max(10000, prediction[0])),
                    'payback_period': float(max(1, prediction[1]))
                }
            else:
                return self._fallback_cost_benefit(structure_type, roof_area, region)
        except Exception as e:
            print(f"Cost prediction error: {e}")
            return self._fallback_cost_benefit(structure_type, roof_area, region)
    
    # Fallback methods (rule-based)
    def _fallback_runoff_coefficient(self, roof_type: str, roof_age: int):
        norm = roof_type.strip().capitalize() if roof_type else 'Concrete'
        coefficients = {
            'Concrete': 0.8, 'Tiled': 0.7, 'Metal': 0.9, 
            'Asbestos': 0.8, 'Thatched': 0.6, 'Plastic': 0.85
        }
        base_coeff = coefficients.get(norm, 0.8)
        age_factor = max(0.7, 1 - (roof_age * 0.01))
        return round(base_coeff * age_factor, 2)
    
    def _fallback_structure_recommendation(self, roof_area: float, open_space: float, 
                                         soil_type: str, water_depth: float):
        soil_norm = soil_type.strip().title() if soil_type else 'Loam'
        if open_space >= 50 and soil_norm in ['Sandy', 'Sandy Loam']:
            return "Recharge_Shaft"
        elif open_space >= 20:
            return "Recharge_Pit" if soil_norm in ['Sandy', 'Sandy Loam'] else "Recharge_Trench"
        elif roof_area >= 50:
            return "Storage_Tank"
        else:
            return "Storage_Tank"
    
    def _fallback_water_harvest(self, roof_area: float, runoff_coeff: float, annual_rainfall: float):
        # Harvestable water = Area (m2) * Rainfall (mm) * Runoff Coefficient
        return round(roof_area * annual_rainfall * runoff_coeff, 2)
    
    def _fallback_cost_benefit(self, structure_type: str, roof_area: float, region: str):
        cost_factors = {
            'Storage_Tank': 150, 'Recharge_Pit': 200, 
            'Recharge_Trench': 250, 'Recharge_Shaft': 300
        }
        region_multiplier = 1.2 if region.lower() == "urban" else 1.0
        
        installation_cost = roof_area * cost_factors.get(structure_type, 200) * region_multiplier
        annual_savings = roof_area * 1000 * 0.7
        payback_period = installation_cost / annual_savings if annual_savings > 0 else 5.0
        
        return {
            'installation_cost': round(installation_cost, 2),
            'payback_period': round(payback_period, 2)
        }

# Initialize the ML service
ml_service = MLModelService()