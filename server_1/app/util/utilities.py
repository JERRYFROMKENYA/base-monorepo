import json
import requests
import pandas as pd

def load_newline_delimited_json(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = []
        for line in response.text.strip().split('\n'):
            try:
                data.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"Skipping invalid JSON line: {line} due to error: {e}")
        return pd.DataFrame(data)
    except requests.exceptions.RequestException as e:
        print(f"Error downloading data: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def process_endpoint_url(endpoint_url, pop_key=None):
    json_result = requests.get(endpoint_url).content
    data = json.loads(json_result)
    if pop_key:
        df_result = pd.json_normalize(data.pop(pop_key), sep='_')
    else:
        df_result = pd.json_normalize(data)
    return df_result