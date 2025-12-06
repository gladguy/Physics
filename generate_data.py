# /// script
# requires-python = ">=3.9"
# dependencies = [
#     "mendeleev",
#     "pandas",
# ]
# ///

import json
from mendeleev import element
import mendeleev

def get_category(el):
    # Map mendeleev series to our categories
    series = el.series_id
    if series == 1: return "Non-metal"
    if series == 2: return "Noble gas"
    if series == 3: return "Alkali metal"
    if series == 4: return "Alkaline earth metal"
    if series == 5: return "Metalloid"
    if series == 6: return "Halogen"
    if series == 7: return "Post-transition metal"
    if series == 8: return "Transition metal"
    if series == 9: return "Lanthanide"
    if series == 10: return "Actinide"
    return "Unknown"

elements_list = []

# Mendeleev has 118 elements
for i in range(1, 119):
    try:
        el = element(i)
        
        # Handle Group/Period
        group = el.group_id
        if group is None:
            # Lanthanides and Actinides
            if 57 <= i <= 71:
                group = "Lanthanide"
            elif 89 <= i <= 103:
                group = "Actinide"
            else:
                group = "-"
        
        # Description/Uses (Mendeleev description is often None, we will use a placeholder or generic text)
        summary = el.description if el.description else f"{el.name} is a chemical element with symbol {el.symbol} and atomic number {el.atomic_number}."
        uses = el.uses if hasattr(el, 'uses') and el.uses else "Used in various chemical applications."
        
        data = {
            "atomic_number": el.atomic_number,
            "symbol": el.symbol,
            "name": el.name,
            "atomic_weight": round(el.atomic_weight, 4) if el.atomic_weight else None,
            "group": group,
            "period": el.period,
            "category": el.series if el.series else "Unknown", # mendeleev 'series' gives string name usually
            "electron_configuration": el.econf if el.econf else "",
            "summary": summary,
            "uses": uses
        }
        elements_list.append(data)
    except Exception as e:
        print(f"Error processing element {i}: {e}")

# Save to JSON
with open('data/elements.json', 'w') as f:
    json.dump(elements_list, f, indent=2)

print(f"Generated data for {len(elements_list)} elements.")
