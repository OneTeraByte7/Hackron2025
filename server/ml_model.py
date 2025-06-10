import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

# Use Agg backend for matplotlib
import matplotlib
matplotlib.use('Agg')

# Load data
waste_data = pd.read_csv('waste_data.csv')
sales_data = pd.read_csv('sales_data.csv')
recycling_data = pd.read_csv('recycling_data.csv')
inventory_data = pd.read_csv('inventory_data.csv')

# Preprocess data
def convert_to_numeric(column):
    return pd.to_numeric(column.astype(str).str.replace(r'[^\d.]', ''), errors='coerce')

# Merge dataframes on Product Name
merged_data = pd.merge(sales_data, inventory_data, on='Product Name')
merged_data = pd.merge(merged_data, waste_data, on='Product Name', how='left')
merged_data = pd.merge(merged_data, recycling_data, left_on='Sale Date', right_on='Recycling Date', how='left')

# Feature Engineering
# ...existing code...

# Convert columns to numeric
merged_data['Quantity Sold'] = convert_to_numeric(merged_data['Quantity Sold'])
merged_data['Stock Level'] = convert_to_numeric(merged_data['Stock Level'])
merged_data['Quantity_x'] = convert_to_numeric(merged_data['Quantity_x'])
merged_data['Quantity_y'] = convert_to_numeric(merged_data['Quantity_y'])

# Fill missing values
merged_data.fillna(0, inplace=True)

# Split data into features and target
X = merged_data[['Quantity Sold', 'Stock Level', 'Quantity_x', 'Quantity_y']]
y = merged_data['Quantity_x']

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

# Visualization
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.5)
plt.xlabel('Actual Waste Quantity')
plt.ylabel('Predicted Waste Quantity')
plt.title('Actual vs Predicted Waste Quantity')
plt.savefig('output_plot.png')
