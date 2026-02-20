#!/usr/bin/env python3
"""Generate TypeScript sample data from CSV files."""

import csv
import json

def read_csv_samples(filepath, sample_type, sample_label):
    """Read samples from CSV file."""
    samples = []
    with open(filepath, 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for idx, row in enumerate(reader, 1):
            # Remove last column (class label)
            values = row[:-1]
            # Join first 30 values as comma-separated string
            values_str = ','.join(values)
            samples.append({
                'id': idx,
                'type': sample_type,
                'values': values_str,
                'label': sample_label
            })
    return samples

# Read samples from both CSV files
valid_samples = read_csv_samples(
    'DATASET/Valid Values/valid_values.csv',
    'valid',
    'LEGIT'
)

fraud_samples = read_csv_samples(
    'DATASET/Fraud Values/fraud_values.csv',
    'fraud',
    'FRAUD'
)

# Generate TypeScript file content
ts_content = """export interface SampleTransaction {
  id: number;
  type: 'valid' | 'fraud';
  values: string; // comma-separated 30 values
  label: string;  // 'LEGIT' or 'FRAUD'
}

export const validSamples: SampleTransaction[] = [
"""

# Add valid samples
for sample in valid_samples:
    ts_content += f"""  {{
    id: {sample['id']},
    type: 'valid',
    values: "{sample['values']}",
    label: '{sample['label']}'
  }},
"""

ts_content += """];

export const fraudSamples: SampleTransaction[] = [
"""

# Add fraud samples
for sample in fraud_samples:
    ts_content += f"""  {{
    id: {sample['id']},
    type: 'fraud',
    values: "{sample['values']}",
    label: '{sample['label']}'
  }},
"""

ts_content += """];

export const allSamples = [...validSamples, ...fraudSamples];

export const getValidSampleCount = () => validSamples.length;
export const getFraudSampleCount = () => fraudSamples.length;
"""

# Write to file
with open('frontend/src/data/sampleData.ts', 'w') as f:
    f.write(ts_content)

print(f"✓ Generated sampleData.ts")
print(f"  Valid samples: {len(valid_samples)}")
print(f"  Fraud samples: {len(fraud_samples)}")
print(f"  Total: {len(valid_samples) + len(fraud_samples)}")
print(f"  File location: frontend/src/data/sampleData.ts")
