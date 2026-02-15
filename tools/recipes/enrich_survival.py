import json
import os

DB_PATH = r"c:\Users\Blair\Downloads\Homemaker Suite\app\public\data\recipes.json"

def enrich():
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Keywords to metadata mapping
    rules = [
        {
            "keywords": ["hardtack", "pilot bread"],
            "temp": "300°F",
            "equipment": ["Mixing bowl", "Baking sheet", "Rolling pin", "Fork"]
        },
        {
            "keywords": ["jerky", "dried meat"],
            "temp": "160°F (Oven) / 145°F (Dehydrator)",
            "equipment": ["Sharp knife", "Baking sheet / Dehydrator racks", "Mixing bowl"]
        },
        {
            "keywords": ["cattail", "forage", "edibles"],
            "temp": "Boiling / Raw",
            "equipment": ["Pot", "Tongs", "Sharp knife"]
        },
        {
            "keywords": ["pemmican"],
            "temp": "Low Heat (Rendering)",
            "equipment": ["Heavy pot", "Mortar & Pestle", "Strainers"]
        },
        {
            "keywords": ["bannock", "ash cake"],
            "temp": "Medium-High (Over coals)",
            "equipment": ["Cast iron skillet / Flat rock", "Mixing bowl"]
        },
        {
            "keywords": ["tea", "pine", "infusion"],
            "temp": "Hot (Not Boiling)",
            "equipment": ["Cup / Pot", "Strainer"]
        }
    ]

    count = 0
    for recipe in data['recipes']:
        title_lower = recipe['title'].lower()
        tags = [t.lower() for t in recipe.get('tags', [])]
        
        for rule in rules:
            if any(k in title_lower for k in rule['keywords']) or any(k in tags for k in rule['keywords']):
                # Only update if not already enriched locally in this run
                recipe.update({
                    "temp": rule['temp'],
                    "equipment": rule['equipment']
                })
                count += 1
                break

    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)

    print(f"Total Enriched: {count}")

if __name__ == "__main__":
    enrich()
