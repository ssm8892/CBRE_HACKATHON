import pandas as pd
import sys
import json
import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def get_isolated_data(user_email, set1_path, set2_path, set3_path):
    df_user = pd.read_csv(set2_path)
    df_location = pd.read_csv(set3_path)
    df_role = pd.read_csv(set1_path)
    
    df_user = df_user[df_user['Email']==user_email]
    df_location = df_location[df_location['Property Address'].str.contains(df_user['Location'].iloc[0]) & df_location['Account'].str.contains(df_user['Client'].iloc[0])]

    dashboards = ["Asset Performance", "Asset Valuation", "Building Health", "Client Accounts", "Energy Usage", "Equipment Health", "Equipment Monitoring", "Facility Utilization", 
        "Investment Returns", "Lease Expirations", "Maintenance Schedules", "New Leases", "Occupancy Rate", "Preventative Maintenance", "Rent Collection", 
        "Revenue Metrics", "Work Order Completion", "Work Order Status"]
    criticality_rank = {"Critical": 3, "High": 2, "Medium": 1, "Low": 0}

    relevant_dashboards = df_user["Dashboard"].unique().tolist()
    user_duties = df_role[df_role["Role"] == df_user["Role"].iloc[0]]["Duties"].str.split(', ').iloc[0]

    df_location["Dashboard"] = df_location.apply(lambda row: get_most_similar_dashboard(row["Insight 1"] + " " + row["Insight 2"] + " " + row["Driver"], dashboards), axis=1)

    relevant_properties = df_location[df_location["Account"] == df_user["Client"].iloc[0]]

    def calculate_score(row):
        user_activity_series = df_user[df_user["Dashboard"] == row["Dashboard"]]["User Activity"]
    # If the property's dashboard is relevant to the user
        if not user_activity_series.empty:
            activity_score = user_activity_series.mean()  # Using mean() to account for multiple entries
            return activity_score + criticality_rank[row["Criticality"]]
    # If not, score based on its relevance to the user's duties
        else:
            most_similar_duty = get_most_similar_duty(row["Insight 1"] + " " + row["Insight 2"] + " " + row["Driver"], user_duties)
            similarity_score = cosine_similarity(TfidfVectorizer().fit_transform([most_similar_duty, row["Insight 1"] + " " + row["Insight 2"] + " " + row["Driver"]]))[0, 1]
        return similarity_score + criticality_rank[row["Criticality"]]

    relevant_properties["Score"] = relevant_properties.apply(calculate_score, axis=1)
    sorted_properties = relevant_properties.sort_values(by="Score", ascending=False)
    sorted_properties = sorted_properties.head(5)

    sorted_properties = sorted_properties.rename(columns={'Property Address': 'Prop_Address', 'Insight 1': 'Ins1', 'Insight 2': 'Ins2'})
    return sorted_properties

def get_most_similar_dashboard(insight, dashboards):
    vectorizer = TfidfVectorizer().fit(dashboards)
    vectors = vectorizer.transform([insight] + dashboards)
    cosine_similarities = cosine_similarity(vectors[0:1], vectors).flatten()
    return dashboards[cosine_similarities[1:].argmax()]

def get_most_similar_duty(insight, duties):
    vectorizer = TfidfVectorizer().fit(duties)
    vectors = vectorizer.transform([insight] + duties)
    cosine_similarities = cosine_similarity(vectors[0:1], vectors).flatten()
    return duties[cosine_similarities[1:].argmax()]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script_name.py user_email@example.com")
        sys.exit(1)

    user_email = sys.argv[1]
    
    set1_path = './input_files/roles_duties_and_insights.csv'
    set2_path = './input_files/recommendation_engine_users.csv'
    set3_path = './input_files/property_insights_extended.csv'

    user_location_data = get_isolated_data(user_email, set1_path, set2_path, set3_path)
    
    # Ensure py_output directory exists
    if not os.path.exists('py_output'):
        os.makedirs('py_output')

    # Write to JSON file in py_output directory
    with open('py_output/script_output.json', 'w') as f:
        json.dump(user_location_data.to_dict(orient='records'), f)
