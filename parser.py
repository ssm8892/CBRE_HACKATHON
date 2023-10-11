import pandas as pd
import sys
import json

def get_isolated_data(user_email, set1_path, set2_path, set3_path):
    # Load the datasets
    set1 = pd.read_csv(set1_path)
    set2 = pd.read_csv(set2_path)
    set3 = pd.read_csv(set3_path)

    # Extracting user's data from set2
    user_data = set2[set2['Email'] == user_email]

    # Extracting insights related to user's role from set1
    user_role_data = set1[set1['Role'] == user_data['Role'].iloc[0]]

    # Extracting properties in user's location from set3
    user_location_data = set3[set3['Address'] == user_data['Location'].iloc[0]]

    return user_data, user_role_data, user_location_data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script_name.py user_email@example.com")
        sys.exit(1)

    user_email = sys.argv[1]
    
    # Paths to the CSV datasets
    set1_path = 'path_to_set1.csv'
    set2_path = 'path_to_set2.csv'
    set3_path = 'path_to_set3.csv'

    user_data, user_role_data, user_location_data = get_isolated_data(user_email, set1_path, set2_path, set3_path)
    
    # Saving the isolated data to JSON files
    with open('user_data.json', 'w') as f:
        json.dump(user_data.to_dict(orient='records'), f)
    with open('user_role_data.json', 'w') as f:
        json.dump(user_role_data.to_dict(orient='records'), f)
    with open('user_location_data.json', 'w') as f:
        json.dump(user_location_data.to_dict(orient='records'), f)
