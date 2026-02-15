"""
Merge RecipeNLG converted recipes with existing RecipeDatabase.json
Creates a combined database with original + survival + general recipes
"""
import json
import os

# Paths
ORIGINAL_DB = r"C:\Users\Blair\Downloads\Homemaker Suite\app\public\data\recipes_CLEAN_BASE.json"
SURVIVAL_DB = r"C:\Users\Blair\Downloads\temp-feature\processed\RecipeDatabase_Survival.json"
GENERAL_DB = r"C:\Users\Blair\Downloads\temp-feature\processed\RecipeDatabase_General.json"
OUTPUT_DB = r"C:\Users\Blair\Downloads\Homemaker Suite\app\public\data\recipes.json"
BACKUP_DB = r"C:\Users\Blair\Downloads\Homemaker Suite\app\public\data\recipes_BACKUP.json"

print("=" * 60)
print("RECIPE DATABASE MERGER")
print("=" * 60)

# Step 1: Backup original database
print("\n[1/4] Backing up original database...")
with open(ORIGINAL_DB, 'r', encoding='utf-8') as f:
    original_data = json.load(f)

with open(BACKUP_DB, 'w', encoding='utf-8') as f:
    json.dump(original_data, f, indent=2, ensure_ascii=False)

print(f"   ✓ Backup saved: RecipeDatabase_BACKUP.json")
print(f"   Original recipe count: {len(original_data['recipes'])}")

# Step 2: Load converted databases
print("\n[2/4] Loading converted recipes...")
with open(SURVIVAL_DB, 'r', encoding='utf-8') as f:
    survival_data = json.load(f)

with open(GENERAL_DB, 'r', encoding='utf-8') as f:
    general_data = json.load(f)

print(f"   Survival recipes: {len(survival_data['recipes']):,}")
print(f"   General recipes: {len(general_data['recipes']):,}")

# Step 3: Merge all recipes
print("\n[3/4] Merging databases...")
all_recipes = original_data['recipes'].copy()

# Add survival recipes
all_recipes.extend(survival_data['recipes'])

# Add general recipes
all_recipes.extend(general_data['recipes'])

print(f"   Total recipes after merge: {len(all_recipes):,}")

# Step 4: Save merged database
print("\n[4/4] Saving merged database...")
merged_db = {"recipes": all_recipes}

with open(OUTPUT_DB, 'w', encoding='utf-8') as f:
    json.dump(merged_db, f, ensure_ascii=False)

# Get file size
file_size = os.path.getsize(OUTPUT_DB) / (1024 * 1024)  # Convert to MB
print(f"   ✓ Saved: RecipeDatabase.json ({file_size:.1f} MB)")

print("\n" + "=" * 60)
print("MERGE COMPLETE!")
print("=" * 60)
print(f"\nRecipe Breakdown:")
print(f"  Original (Homemaker): {len(original_data['recipes']):,}")
print(f"  Survival (RecipeNLG): {len(survival_data['recipes']):,}")
print(f"  General (RecipeNLG):  {len(general_data['recipes']):,}")
print(f"  TOTAL:                {len(all_recipes):,}")
print(f"\nDatabase size: {file_size:.1f} MB")
print(f"Backup location: RecipeDatabase_BACKUP.json")
