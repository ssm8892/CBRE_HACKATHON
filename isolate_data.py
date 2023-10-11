import pandas as pd
import sys
import json
import os

def get_isolated_data(user_email, set1_path, set2_path, set3_path):
    set1 = pd.read_csv(set1_path)
    set2 = pd.read_csv(set2_path)
    set3 = pd.read_csv(set3_path)

    user_data = set2[set2['Email'] == user_email]
    user_role_data = set1[set1['Role'] == user_data['Role'].iloc[0]]
    user_location_data = set3[set3['Property Address'].str.contains(user_data['Location'].iloc[0]) & set3['Account'].str.contains(user_data['Client'].iloc[0])]

    return user_data, user_role_data, user_location_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script_name.py user_email@example.com")
        sys.exit(1)

    user_email = sys.argv[1]
    
    set1_path = './input_files/roles_duties_and_insights.csv'
    set2_path = './input_files/recommendation_engine_users.csv'
    set3_path = './input_files/property_insights_extended.csv'

    user_data, user_role_data, user_location_data = get_isolated_data(user_email, set1_path, set2_path, set3_path)
    
    # Ensure py_output directory exists
    if not os.path.exists('py_output'):
        os.makedirs('py_output')

    # Write to JSON files in py_output directory
    with open('py_output/user_data.json', 'w') as f:
        json.dump(user_data.to_dict(orient='records'), f)
    with open('py_output/user_role_data.json', 'w') as f:
        json.dump(user_role_data.to_dict(orient='records'), f)
    with open('py_output/user_location_data.json', 'w') as f:
        json.dump(user_location_data.to_dict(orient='records'), f)
