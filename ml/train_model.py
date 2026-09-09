import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
import joblib

data = pd.read_csv("ml/dataset.csv")

X = data[["user_interest","event_category","location"]]
y = data["booked"]

X = pd.get_dummies(X)

X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2)

model = XGBClassifier()
model.fit(X_train,y_train)

joblib.dump(model,"ml/model.pkl")

print("Model trained successfully")