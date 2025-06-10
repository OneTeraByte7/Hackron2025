import csv
from datetime import datetime

# Sample data
inventory_data = [
    ["Product Name", "SKU", "Stock Level", "Expiration Date"],
    ["Milk", "001", 50, "2025-03-15"],
    ["Bread", "002", 30, "2025-03-20"],
    ["Eggs", "003", 100, "2025-03-25"]
]

sales_data = [
    ["Order ID", "Product Name", "Quantity Sold", "Sale Date"],
    ["1001", "Milk", 2, "2025-03-01"],
    ["1002", "Bread", 1, "2025-03-01"],
    ["1003", "Eggs", 12, "2025-03-02"]
]

waste_data = [
    ["Product Name", "Type of Waste", "Quantity", "Disposal Date"],
    ["Milk", "Expired", "5 liters", "2025-03-16"],
    ["Bread", "Stale", "10 loaves", "2025-03-21"],
    ["Eggs", "Broken", "6 dozen", "2025-03-26"]
]

recycling_data = [
    ["Material", "Quantity", "Recycling Date"],
    ["Plastic", "10 kg", "2025-03-16"],
    ["Cardboard", "5 kg", "2025-03-21"],
    ["Glass", "2 kg", "2025-03-26"]
]

operational_data = [
    ["Operational Aspect", "Details"],
    ["Packaging Materials", "Biodegradable"],
    ["Delivery Route", "Route A, Route B, Route C"]
]

customer_feedback = [
    ["Feedback ID", "Product Name", "Feedback", "Date"],
    ["2001", "Milk", "Good quality", "2025-03-01"],
    ["2002", "Bread", "Too stale", "2025-03-02"],
    ["2003", "Eggs", "Broken in delivery", "2025-03-03"]
]

# Function to write data to CSV
def write_to_csv(filename, data):
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(data)

# Writing data to CSV files
write_to_csv('inventory_data.csv', inventory_data)
write_to_csv('sales_data.csv', sales_data)
write_to_csv('waste_data.csv', waste_data)
write_to_csv('recycling_data.csv', recycling_data)
write_to_csv('operational_data.csv', operational_data)
write_to_csv('customer_feedback.csv', customer_feedback)

print("CSV files have been created successfully.")
