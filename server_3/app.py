from flask import Flask, request, jsonify
import os
import pandas as pd
import chromadb
import google.generativeai as genai
from chromadb import Documents, EmbeddingFunction, Embeddings
from chromadb.config import Settings
import time

app = Flask(__name__)

# Configure API key
API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=API_KEY)

# Define a custom settings object with a timeout parameter
client_settings = Settings(
    persist_directory=".chromadb",
    allow_reset=True,
    is_persistent=True,
)
chroma_client = chromadb.Client(client_settings)


# Load and clean data
mlb_hr_csvs_list = [
    'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2016-mlb-homeruns.csv',
    'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2017-mlb-homeruns.csv',
    'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-mlb-homeruns.csv',
    'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-postseason-mlb-homeruns.csv'
]




mlb_hrs = pd.DataFrame({'csv_file': mlb_hr_csvs_list})
mlb_hrs['season'] = mlb_hrs['csv_file'].str.extract(r'/datasets/(\d{4})')
mlb_hrs['hr_data'] = mlb_hrs['csv_file'].apply(pd.read_csv)

for index, row in mlb_hrs.iterrows():
    hr_df = row['hr_data']
    hr_df['season'] = row['season']

all_mlb_hrs = (pd.concat(mlb_hrs['hr_data'].tolist(), ignore_index=True)
               [['season', 'play_id', 'title', 'ExitVelocity', 'LaunchAngle', 'HitDistance', 'video']])

def clean_data(df):
    numerical_cols = ['ExitVelocity', 'LaunchAngle', 'HitDistance']
    for col in numerical_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].mean())
    non_numerical_cols = [col for col in df.columns if col not in numerical_cols + ['title', 'play_id', 'season']]
    for col in non_numerical_cols:
        df[col] = df[col].fillna('invalid')
    df = df.dropna(subset=['title'])
    df = df.drop_duplicates(subset=['play_id'], keep='first')
    return df

all_mlb_hrs = clean_data(all_mlb_hrs)

hr_documents = []
hr_metadatas = []
hr_ids = []
seen_ids = set()

for index, hr in enumerate(all_mlb_hrs.iterrows()):
    if pd.isna(hr[1]['title']):
        continue
    if hr[1]['play_id'] in seen_ids:
        continue
    seen_ids.add(hr[1]['play_id'])
    title = str(hr[1]['title']) if pd.notna(hr[1]['title']) else ""
    hr_documents.append(hr[1]['title'])
    hr_metadatas.append({
        'season': hr[1]['season'],
        'play_id': hr[1]['play_id'],
        'ExitVelocity': hr[1]['ExitVelocity'],
        'LaunchAngle': hr[1]['LaunchAngle'],
        'HitDistance': hr[1]['HitDistance'],
        'video': hr[1]['video'],
        'title': title
    })
    hr_ids.append(str(index))

class GeminiEmbeddingFunction(EmbeddingFunction):
    def __call__(self, input: Documents) -> Embeddings:
        model = 'models/embedding-001'
        title = "Mlb_Data"
        filtered_input = [doc for doc in input if doc and pd.notna(doc)]
        if not filtered_input:
            return [[] for _ in range(len(input))]
        try:
            embeddings = genai.embed_content(
                model=model,
                content=filtered_input,
                task_type="retrieval_document",
                title=title,
            )["embedding"]
            if not isinstance(embeddings[0], list) or not all(isinstance(x, (int, float)) for x in embeddings[0]):
                embeddings = [[] for _ in range(len(input))]
            return embeddings
        except Exception as e:
            print(f"Error during embedding generation for input: {filtered_input[:5]} - Error: {e}")
            return [[] for _ in range(len(input))]


def create_chroma_db(documents, ids, metadatas, name):
    start_time = time.time()
    try:
        db = chroma_client.get_collection(name=name, embedding_function=GeminiEmbeddingFunction())
        print(f"Collection '{name}' already exists. Using existing collection.")
    except:
        db = chroma_client.create_collection(name=name, embedding_function=GeminiEmbeddingFunction(),
                                             metadata={"hnsw:num_threads": 16})
        print(f"Collection '{name}' created.")

    existing_documents = set(db.get()["documents"])
    new_documents = []
    new_metadatas = []
    new_ids = []

    for doc, meta, doc_id in zip(documents, metadatas, ids):
        if doc not in existing_documents:
            new_documents.append(doc)
            new_metadatas.append(meta)
            new_ids.append(doc_id)

    if new_documents:
        db.add(documents=new_documents, metadatas=new_metadatas, ids=new_ids)
        print(f"Added {len(new_documents)} new documents to the database.")
    else:
        print("No new documents to add.")

    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Time taken to generate collection: {elapsed_time:.2f} seconds")
    return db

@app.route('/home_runs', methods=["GET"])
def home_runs():
    hr_db = chroma_client.get_collection(name="mlb_hrs_001", embedding_function=GeminiEmbeddingFunction())
    search = request.args.get('q', '').strip('"').strip("'")
    season = request.args.get('season', '').strip('"').strip("'")
    launch_angle = request.args.get('launchAngle', '').strip('"').strip("'")
    exit_velocity = request.args.get('exitVelocity', '').strip('"').strip("'")
    hit_distance = request.args.get('hitDistance', '').strip('"').strip("'")

    # Filter out None values from the where statement
    where_clauses = []
    if season:
        where_clauses.append({"season": season})
    if launch_angle:
        where_clauses.append({"LaunchAngle": launch_angle})
    if exit_velocity:
        where_clauses.append({"ExitVelocity": exit_velocity})
    if hit_distance:
        where_clauses.append({"HitDistance": hit_distance})

    where_statement = {"$or": where_clauses} if len(where_clauses) > 1 else {}

    _data = []

    if not search and not where_statement:
        documents = hr_db.get()["metadatas"]
        for doc in documents:
            _data.append({
                'title': doc['title'],
                'ExitVelocity': doc['ExitVelocity'],
                'LaunchAngle': doc['LaunchAngle'],
                'HitDistance': doc['HitDistance'],
                'video': doc['video'],
                'season': doc['season'],
                'play_id': doc['play_id']
            })
    else:
        documents = hr_db.query(query_texts=[search],
                                where=where_statement if where_statement else None
                                )["metadatas"][0]
        for doc in documents:
            _data.append({
                'title': doc['title'],
                'ExitVelocity': doc['ExitVelocity'],
                'LaunchAngle': doc['LaunchAngle'],
                'HitDistance': doc['HitDistance'],
                'video': doc['video'],
                'season': doc['season'],
                'play_id': doc['play_id']
            })

    return jsonify(_data)


@app.route('/home_run', methods=["GET"])
def query():
    hr_db=chroma_client.get_collection(name="mlb_hrs_001", embedding_function=GeminiEmbeddingFunction())
    query_text = request.args.get('playId', '').strip('"').strip("'")


    _data=[]
    if query_text:
        documents = hr_db.query(where={"play_id":query_text})["metadatas"][0]
        for doc in documents:
            print(doc)
            _data.append({
                'title': doc['title'],
                'ExitVelocity': doc['ExitVelocity'],
                'LaunchAngle': doc['LaunchAngle'],
                'HitDistance': doc['HitDistance'],
                'video': doc['video'],
                'season': doc['season'],
                'play_id': doc['play_id']
            })



    return jsonify(_data)

@app.route('/generate_hr_data', methods=['GET'])
def generate_hr_data():
    _data=[]
    hr_db = create_chroma_db(hr_documents, hr_ids, hr_metadatas, name='mlb_hrs_001')
    return jsonify(dict(hr_db.get_model()))

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False ,host= "0.0.0.0", port=9000,)