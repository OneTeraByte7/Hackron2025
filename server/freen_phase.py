import pandas as pd
from datetime import datetime
from tabulate import tabulate

# Read data from CSV file
df = pd.read_csv('sample_dataset.csv')

# Convert dates to datetime objects
df["manufacturing_date"] = pd.to_datetime(df["manufacturing_date"], format="%Y-%m-%d")
df["expiry_date"] = pd.to_datetime(df["expiry_date"], format="%Y-%m-%d")

# Lists to store red, yellow, and green products
red_products = []
yellow_products = []
green_products = []

# Calculate the difference in months
for index, row in df.iterrows():
    mfg_date = row["manufacturing_date"]
    exp_date = row["expiry_date"]
    difference_in_months = (exp_date.year - mfg_date.year) * 12 + exp_date.month - mfg_date.month
    if difference_in_months <= 1:
        row["tag"] = "red"
        red_products.append(row)
    elif difference_in_months <= 3:
        row["tag"] = "yellow"
        yellow_products.append(row)
    else:
        row["tag"] = "green"
        green_products.append(row)

# Convert lists to DataFrames
red_df = pd.DataFrame(red_products)
yellow_df = pd.DataFrame(yellow_products)
green_df = pd.DataFrame(green_products)

# Display data in table format
print("Red Products:")
print(tabulate(red_df, headers='keys', tablefmt='psql'))

print("\nYellow Products:")
print(tabulate(yellow_df, headers='keys', tablefmt='psql'))

print("\nGreen Products:")
print(tabulate(green_df, headers='keys', tablefmt='psql'))