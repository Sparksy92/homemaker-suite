"""
RecipeNLG to Homemaker Suite Converter
Converts RecipeNLG CSV format to Homemaker Suite JSON format with survival tagging
"""
import pandas as pd
import json
import os
import re

# Paths
DATASET_PATH = r"C:\Users\Blair\Downloads\Homemaker Suite\temp-feature\dataset\full_dataset.csv"
OUTPUT_DIR = r"C:\Users\Blair\Downloads\Homemaker Suite\temp-feature\processed"
SURVIVAL_OUTPUT = os.path.join(OUTPUT_DIR, "RecipeDatabase_Survival.json")
GENERAL_OUTPUT = os.path.join(OUTPUT_DIR, "RecipeDatabase_General.json")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Survival keywords (same as analyzer)
SURVIVAL_KEYWORDS = [
    'dried beans', 'canned', 'preserved', 'fermented', 'pickled',
    'rice', 'lentils', 'oats', 'wheat', 'flour',
    'dutch oven', 'cast iron', 'campfire', 'solar', 'off-grid',
    'shelf stable', 'long-term', 'emergency', 'survival',
    'dehydrated', 'freeze dried', 'smoked', 'cured', 'salted',
    'buttermilk', 'yeast', 'sourdough', 'bacon', 'lard'
]

def parse_json_field(field):
    """Parse JSON string fields (ingredients, directions)"""
    try:
        if pd.isna(field):
            return []
        # Parse the JSON array string
        parsed = json.loads(field)
        return parsed if isinstance(parsed, list) else []
    except:
        return []

def estimate_cook_time(directions):
    """Estimate cooking time from directions"""
    # Look for time patterns like "20 minutes", "1 hour", etc.
    time_patterns = re.findall(r'(\d+)\s*(minute|min|hour|hr)', ' '.join(directions).lower())
    if time_patterns:
        total_minutes = sum(
            int(num) if 'min' in unit else int(num) * 60 
            for num, unit in time_patterns
        )
        if total_minutes < 60:
            return f"{total_minutes}m"
        else:
            hours = total_minutes // 60
            mins = total_minutes % 60
            return f"{hours}h {mins}m" if mins else f"{hours}h"
    return "30m"  # Default

def estimate_difficulty(ingredients, directions):
    """Estimate difficulty (1-3 scale) based on complexity"""
    ingredient_count = len(ingredients)
    step_count = len(directions)
    
    # Simple heuristic
    if ingredient_count <= 5 and step_count <= 4:
        return 1
    elif ingredient_count <= 10 and step_count <= 8:
        return 2
    else:
        return 3

def categorize_recipe(title, ingredients, directions):
    """Categorize recipe based on title and ingredients"""
    text = (title + ' ' + ' '.join(ingredients)).lower()
    
    if any(word in text for word in ['bread', 'biscuit', 'roll', 'muffin', 'cake', 'cookie', 'pie']):
        return "Baking"
    elif any(word in text for word in ['breakfast', 'pancake', 'waffle', 'omelette', 'frittata']):
        return "Breakfast"
    elif any(word in text for word in ['soup', 'stew', 'chili', 'broth']):
        return "Soups & Stews"
    elif any(word in text for word in ['pickle', 'ferment', 'can', 'preserve', 'jam', 'jelly']):
        return "Preservation"
    elif any(word in text for word in ['deer', 'venison', 'rabbit', 'duck', 'goose', 'pheasant', 'wild']):
        return "Wild Game"
    elif any(word in text for word in ['chicken', 'beef', 'pork', 'fish', 'meat']):
        return "Dinner"
    elif any(word in text for word in ['sauce', 'gravy', 'dressing']):
        return "Sauces"
    else:
        return "Pantry Staples"

def calculate_survival_rating(title, ingredients, directions):
    """Calculate survival rating 1-5 based on grid-down viability"""
    text = (title + ' ' + ' '.join(ingredients) + ' ' + ' '.join(directions)).lower()
    rating = 3  # Default
    
    # Bonus for specific survival-friendly traits
    if any(word in text for word in ['canned', 'dried', 'preserved', 'shelf stable']):
        rating += 1
    if any(word in text for word in ['cast iron', 'dutch oven', 'campfire', 'solar']):
        rating += 1
    if any(word in text for word in ['microwave', 'blender', 'food processor', 'sous vide']):
        rating -= 1
    if any(word in text for word in ['exotic', 'truffle', 'caviar', 'saffron']):
        rating -= 1
    
    return max(1, min(5, rating))  # Clamp to 1-5

def convert_recipe(row, is_survival=False):
    """Convert a RecipeNLG row to Homemaker Suite format"""
    title = str(row['title'])
    ingredients = parse_json_field(row['ingredients'])
    directions = parse_json_field(row['directions'])
    
    # Skip if missing critical data
    if not title or not ingredients or not directions:
        return None
    
    # Create Homemaker Suite recipe object
    recipe = {
        "id": f"recipenlg-{row['Unnamed: 0']}",
        "title": title,
        "category": categorize_recipe(title, ingredients, directions),
        "source": "RecipeNLG",
        "prep_time": "15m",  # Default
        "cook_time": estimate_cook_time(directions),
        "ingredients": ingredients,
        "steps": directions,
        "tags": []
    }
    
    # Add survival tag if applicable
    if is_survival:
        recipe["tags"].append("survival")
        recipe["tags"].append("grid-down")
        recipe["survival_rating"] = calculate_survival_rating(title, ingredients, directions)
    else:
        recipe["tags"].append("general")
    
    # Add difficulty
    recipe["difficulty"] = estimate_difficulty(ingredients, directions)
    
    return recipe

print("=" * 60)
print("RECIPENLG TO HOMEMAKER SUITE CONVERTER")
print("=" * 60)

# Step 1: Load and convert survival recipes
print("\n[1/3] Converting SURVIVAL recipes...")
survival_recipes = []
chunk_size = 100000
chunk_num = 0
survival_count = 0

for chunk in pd.read_csv(DATASET_PATH, chunksize=chunk_size):
    chunk_num += 1
    print(f"   Processing chunk {chunk_num}... ({len(chunk):,} recipes)")
    
    for idx, row in chunk.iterrows():
        # Check for survival keywords
        text = str(row.get('title', ''))
        text += ' ' + str(row.get('ingredients', ''))
        text += ' ' + str(row.get('directions', ''))
        text = text.lower()
        
        if any(keyword in text for keyword in SURVIVAL_KEYWORDS):
            recipe = convert_recipe(row, is_survival=True)
            if recipe and len(survival_recipes) < 10000:  # Cap at 10k
                survival_recipes.append(recipe)
                survival_count += 1
            
        if len(survival_recipes) >= 10000:
            break
    
    if len(survival_recipes) >= 10000:
        break

print(f"\n   ✓ Converted {len(survival_recipes):,} survival recipes")

# Step 2: Load and convert general recipes (smaller sample)
print("\n[2/3] Converting GENERAL recipes (sampling 1 in 100)...")
general_recipes = []
chunk_num = 0

for chunk in pd.read_csv(DATASET_PATH, chunksize=chunk_size):
    chunk_num += 1
    print(f"   Processing chunk {chunk_num}... ({len(chunk):,} recipes)")
    
    for idx, row in chunk.iterrows():
        # Sample 1 in 100 for general recipes
        if idx % 100 == 0 and len(general_recipes) < 20000:
            # Check it's not already a survival recipe
            text = str(row.get('title', '')) + ' ' + str(row.get('ingredients', ''))
            text = text.lower()
            
            is_survival = any(keyword in text for keyword in SURVIVAL_KEYWORDS)
            if not is_survival:
                recipe = convert_recipe(row, is_survival=False)
                if recipe:
                    general_recipes.append(recipe)
        
        if len(general_recipes) >= 20000:
            break
    
    if len(general_recipes) >= 20000:
        break

print(f"\n   ✓ Converted {len(general_recipes):,} general recipes")

# Step 3: Save outputs
print("\n[3/3] Saving JSON files...")

# Save survival recipes
with open(SURVIVAL_OUTPUT, 'w', encoding='utf-8') as f:
    json.dump({"recipes": survival_recipes}, f, indent=2, ensure_ascii=False)
print(f"   ✓ Saved {len(survival_recipes):,} recipes to RecipeDatabase_Survival.json")

# Save general recipes
with open(GENERAL_OUTPUT, 'w', encoding='utf-8') as f:
    json.dump({"recipes": general_recipes}, f, indent=2, ensure_ascii=False)
print(f"   ✓ Saved {len(general_recipes):,} recipes to RecipeDatabase_General.json")

print("\n" + "=" * 60)
print("CONVERSION COMPLETE!")
print("=" * 60)
print(f"\nSurvival Recipes: {len(survival_recipes):,}")
print(f"General Recipes: {len(general_recipes):,}")
print(f"Total: {len(survival_recipes) + len(general_recipes):,}")
print(f"\nOutput directory: {OUTPUT_DIR}")
