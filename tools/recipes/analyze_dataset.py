"""
RecipeNLG Dataset Analyzer
Analyzes the schema and filters recipes for Homemaker Suite integration
"""
import pandas as pd
import json
import os

# Paths
DATASET_PATH = r"C:\Users\Blair\Downloads\Homemaker Suite\temp-feature\dataset\full_dataset.csv"
OUTPUT_DIR = r"C:\Users\Blair\Downloads\Homemaker Suite\temp-feature\processed"

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 60)
print("RECIPENLG DATASET ANALYZER")
print("=" * 60)

# Step 1: Load first 1000 rows to analyze schema
print("\n[1/5] Loading sample data to analyze schema...")
sample_df = pd.read_csv(DATASET_PATH, nrows=1000)

print(f"   Columns found: {list(sample_df.columns)}")
print(f"   Sample size: {len(sample_df)} rows")
print("\n   Sample row:")
print(sample_df.iloc[0].to_dict())

# Step 2: Identify survival keywords
print("\n[2/5] Defining survival keywords...")
SURVIVAL_KEYWORDS = [
    'dried beans', 'canned', 'preserved', 'fermented', 'pickled',
    'rice', 'lentils', 'oats', 'wheat', 'flour',
    'dutch oven', 'cast iron', 'campfire', 'solar', 'off-grid',
    'shelf stable', 'long-term', 'emergency', 'survival',
    'dehydrated', 'freeze dried', 'smoked', 'cured', 'salted'
]

print(f"   Tracking {len(SURVIVAL_KEYWORDS)} keywords")

# Step 3: Count total recipes
print("\n[3/5] Counting total recipes in dataset...")
total_count = 0
chunk_size = 100000

for chunk in pd.read_csv(DATASET_PATH, chunksize=chunk_size):
    total_count += len(chunk)

print(f"   Total recipes: {total_count:,}")

# Step 4: Filter for survival recipes
print("\n[4/5] Filtering for survival-tagged recipes...")
survival_recipes = []
general_recipes_sample = []
survival_count = 0
chunk_num = 0

for chunk in pd.read_csv(DATASET_PATH, chunksize=chunk_size):
    chunk_num += 1
    print(f"   Processing chunk {chunk_num}... ({len(chunk):,} recipes)")
    
    for idx, row in chunk.iterrows():
        # Combine title, ingredients, and directions for keyword search
        text = str(row.get('title', ''))
        text += ' ' + str(row.get('ingredients', ''))
        text += ' ' + str(row.get('directions', ''))
        text = text.lower()
        
        # Check for survival keywords
        if any(keyword in text for keyword in SURVIVAL_KEYWORDS):
            survival_count += 1
            if len(survival_recipes) < 10000:  # Cap at 10k
                survival_recipes.append(row.to_dict())
        else:
            # Sample general recipes (1 in 50)
            if len(general_recipes_sample) < 50000 and idx % 50 == 0:
                general_recipes_sample.append(row.to_dict())

print(f"\n   Survival recipes found: {survival_count:,}")
print(f"   Survival recipes captured: {len(survival_recipes):,}")
print(f"   General recipes sampled: {len(general_recipes_sample):,}")

# Step 5: Save analysis results
print("\n[5/5] Saving analysis results...")

analysis_report = {
    "total_recipes": total_count,
    "survival_recipes_found": survival_count,
    "survival_recipes_captured": len(survival_recipes),
    "general_recipes_sampled": len(general_recipes_sample),
    "columns": list(sample_df.columns),
    "sample_recipe": sample_df.iloc[0].to_dict()
}

with open(os.path.join(OUTPUT_DIR, "analysis_report.json"), 'w', encoding='utf-8') as f:
    json.dump(analysis_report, f, indent=2)

print(f"   ✓ Analysis report saved")

# Save survival recipes sample
with open(os.path.join(OUTPUT_DIR, "survival_recipes_sample.json"), 'w', encoding='utf-8') as f:
    json.dump(survival_recipes[:100], f, indent=2)  # First 100 for review

print(f"   ✓ Survival sample saved (100 recipes)")

print("\n" + "=" * 60)
print("ANALYSIS COMPLETE!")
print("=" * 60)
print(f"\nResults saved to: {OUTPUT_DIR}")
print("\nNext steps:")
print("1. Review analysis_report.json")
print("2. Review survival_recipes_sample.json")
print("3. Run converter script to create RecipeDatabase_Extended.json")
