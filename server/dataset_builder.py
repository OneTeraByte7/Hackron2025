import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Generate random dates within a range
def random_date(start, end):
    return start + timedelta(days=random.randint(0, (end - start).days))

# Define the date range for manufacturing and expiry dates
start_date = datetime.strptime('2022-01-01', '%Y-%m-%d')
end_date = datetime.strptime('2025-01-01', '%Y-%m-%d')

# Create a sample dataset
data = {
    'product_id': [f'P{str(i).zfill(5)}' for i in range(1, 101)],
    'manufacturing_date': [random_date(start_date, end_date) for _ in range(100)],
    'expiry_date': [random_date(start_date, end_date) for _ in range(100)],
}

df = pd.DataFrame(data)
print(df)

# Save to CSV
df.to_csv('sample_dataset.csv', index=False)
