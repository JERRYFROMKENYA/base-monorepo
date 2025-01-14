import os
import pandas as pd
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings, Settings
import google.generativeai as genai
import numpy as np
import json
from app.util.utilities import load_newline_delimited_json

API_KEY = os.getenv('GENAI_API_KEY')
if not API_KEY:
    raise ValueError("API key not found. Please set the GENAI_API_KEY environment variable.")
genai.configure(api_key=API_KEY)

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> list[float]:
        model = "models/text-embedding-004"
        title = "MLB Data"
        return genai.embed_content(model=model,
                                   content=input,
                                   task_type="retrieval_document",
                                   title=title)["embedding"]


def initialize():
    # Initialize Chroma client and collections
    print("Initializing Chroma client and collections...")
    client = chromadb.Client()

    # Create collections
    hr_collection = client.create_collection(name='mlb_home_runs', embedding_function=GeminiEmbeddingFunction())
    # captions_collection = client.create_collection(name='mlb_captions', embedding_function=GeminiEmbeddingFunction())

    # Define CSV URLs for home runs
    mlb_hr_csvs_list = [
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2016-mlb-homeruns.csv',
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2017-mlb-homeruns.csv',
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-mlb-homeruns.csv',
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-postseason-mlb-homeruns.csv'
    ]

    # Process each CSV file for home runs
    for csv_url in mlb_hr_csvs_list:
        print(f"Processing CSV file: {csv_url}")
        df = pd.read_csv(csv_url)
        season = csv_url.split('/')[-1].split('-')[0]
        df['season'] = season
        documents = df.to_dict(orient='records')
        ids = [f"{season}_{i}" for i in range(len(documents))]
        documents = [json.dumps(doc) for doc in documents]  # Convert documents to JSON strings
        hr_collection.upsert(ids=ids, documents=documents)
        print(f"Upserted {len(documents)} documents for season {season}")

    # Process captions JSON files
    # mlb_captions_base_url = 'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/mlb-caption-data/mlb-captions-data-*.json'
    # all_dfs = []
    # for i in np.arange(0, 13):
    #     this_url = mlb_captions_base_url.replace("*", str(i).zfill(12))
    #     print(f"Processing JSON file: {this_url}")
    #     this_df = load_newline_delimited_json(this_url)
    #     all_dfs.append(this_df)
    # mlb_captions_df = pd.concat(all_dfs, ignore_index=True)
    # documents = mlb_captions_df.to_dict(orient='records')
    # ids = [f"caption_{i}" for i in range(len(documents))]
    # documents = [json.dumps(doc) for doc in documents]  # Convert documents to JSON strings
    # captions_collection.upsert(ids=ids, documents=documents)
    # print(f"Upserted {len(documents)} caption documents")

    print("Initialization complete.")

