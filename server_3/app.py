import json
import subprocess
import threading
import typing
from flask import Flask, request, jsonify
import os
import pandas as pd
import chromadb
import google.generativeai as genai
from chromadb import Documents, EmbeddingFunction, Embeddings
from chromadb.config import Settings
import time
import requests


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

    if not data:
        return pd.DataFrame()

    if pop_key:
        if pop_key in data:
            df_result = pd.json_normalize(data.pop(pop_key), sep='_')
        else:
            print(f"Key '{pop_key}' not found in the data.")
            return data
    else:
        df_result = pd.json_normalize(data)

    return df_result

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file




app = Flask(__name__)

# Configure API key
API_KEY = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=API_KEY)

# Define a custom settings object with a timeout parameter
client_settings = Settings(
    persist_directory="chromadb",
    allow_reset=True,
    is_persistent=True,
)
chroma_client = chromadb.Client(client_settings)


def get_translation(text, lang):
    translation_system_prompt = f'''
    You are a language translation system that translates text from one language to another.
    Your job is to translate the text provided to {lang}. You refine the translation, not for the sake of accuracy, 
    but for the sake of fluency.
    '''
    class TranslationSchema(typing.TypedDict):
        translation: str
        lang: str

    translation_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=TranslationSchema
    )

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                    system_instruction=translation_system_prompt,
                                    generation_config=translation_config)

    response = model.generate_content([text, lang])

    result_data = json.loads(response.text)

    return result_data

def get_players_seen(video_url):
    get_players_seen_system_prompt = '''
    You are a multimodal system that analyzes videos of baseball at 1 frame per second.
    Your job is to identify the players seen in the video and return their names.
    Use both the video and audio streams to piece together the required data
    '''
    class PlayerSchema(typing.TypedDict):
        playerName: str
        position: str

    class PlayerSeenSchema(typing.TypedDict):
        players: typing.List[PlayerSchema]

    get_players_seen_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=PlayerSeenSchema
    )
    path = "video.mp4"
    if not video_url:
        return []
    def download_video():
        try:
            subprocess.run(['wget', video_url, '-O', path], check=True)
        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"Failed to download video: {e}"}), 500
    download_thread = threading.Thread(target=download_video)
    download_thread.start()
    download_thread.join()

    video_file = genai.upload_file(path=path)

    # Wait until the uploaded video is available
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                  system_instruction=get_players_seen_system_prompt,
                                  generation_config=get_players_seen_config)

    response = model.generate_content(["Analyze the following video:", video_file])
    result_data = json.loads(response.text)
    print(response.text)
    os.remove(path)

    return result_data

def get_video_summary(video_url):
    get_video_summary_system_prompt = '''
    You are a multimodal system that analyzes videos of baseball at 1 frame per second.
    Your job is to provide a summary of the video.
    Use both the video and audio streams to piece together the required data
    '''

    class VideoSummarySchema(typing.TypedDict):
        summary: str

    get_video_summary_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=VideoSummarySchema
    )

    path = "video.mp4"

    if not video_url:
        return []

    def download_video():
        try:
            subprocess.run(['wget', video_url, '-O', path], check=True)
        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"Failed to download video: {e}"}), 500

    download_thread = threading.Thread(target=download_video)
    download_thread.start()
    download_thread.join()

    video_file = genai.upload_file(path=path)

    # Wait until the uploaded video is available
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500


    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                  system_instruction=get_video_summary_system_prompt,
                                  generation_config=get_video_summary_config)

    response = model.generate_content(["give me highlights of the above game", video_file])

    result_data = json.loads(response.text)
    print(response.text)
    os.remove(path)

    return result_data

def get_play_explanation(video_url):
    get_play_explanation_system_prompt = '''
        You are a system that analyzes videos of baseball at 1 frame per second. 
        You understand the game of baseball and can provide a summary of the play.
        You explain to the user why the play was made and why it was the best or worst play for either side.
        Use both the video and audio streams to piece together the required data
        '''



    class PlayExplanationSchema(typing.TypedDict):
        explanation: str

    get_play_explanation_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=PlayExplanationSchema
    )
    path = "video.mp4"
    if not video_url:
        return []

    def download_video():
        try:
            subprocess.run(['wget', video_url, '-O', path], check=True)
        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"Failed to download video: {e}"}), 500

    download_thread = threading.Thread(target=download_video)
    download_thread.start()
    download_thread.join()

    video_file = genai.upload_file(path=path)

    # Wait until the uploaded video is available
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                  system_instruction=get_play_explanation_system_prompt,
                                  generation_config=get_play_explanation_config)

    response = model.generate_content(["Analyze the following video:", video_file])
    result_data = json.loads(response.text)
    print(response.text)
    os.remove(path)

    return result_data

def get_teams(video_url,season):
    get_teams_system_prompt = '''
    You are a multimodal system that analyzes videos of baseball at 1 frame per second.
    Your job is to identify the teams playing in the video.
    Use both the video and audio streams to piece together the required data
    '''

    class TeamSchema(typing.TypedDict):
        teamName: str
        abbreviation: str

    class TeamsSchema(typing.TypedDict):
        teams: typing.List[TeamSchema]

    get_teams_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=TeamsSchema
    )

    get_players_seen_system_prompt = '''
        You are a multimodal system that analyzes videos of baseball at 1 frame per second.
        Your job is to identify the players seen in the video and return their names.
        Use both the video and audio streams to piece together the required data
        '''

    class PlayerSchema(typing.TypedDict):
        playerName: str
        position: str

    class PlayerSeenSchema(typing.TypedDict):
        players: typing.List[PlayerSchema]

    get_players_seen_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=PlayerSeenSchema
    )

    path = "video.mp4"
    if not video_url:
        return []

    def download_video():
        try:
            subprocess.run(['wget', video_url, '-O', path], check=True)
        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"Failed to download video: {e}"}), 500

    download_thread = threading.Thread(target=download_video)
    download_thread.start()
    download_thread.join()

    video_file = genai.upload_file(path=path)

    # Wait until the uploaded video is available
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                  system_instruction=get_players_seen_system_prompt,
                                  generation_config=get_players_seen_config)

    response = model.generate_content(["Analyze the following video:", video_file])
    players_data = json.loads(response.text)['players']

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                  system_instruction=get_teams_system_prompt,
                                  generation_config=get_teams_config)

    response = model.generate_content(["Analyze the following video:", video_file])
    result_data = json.loads(response.text)
    print(response.text)
    os.remove(path)
    teams_ = []

    teams_endpoint_url = f'https://statsapi.mlb.com/api/v1/teams'
    teams = process_endpoint_url(teams_endpoint_url, 'teams')

    team_rosters = {}
    for team in result_data["teams"]:
        team_name = team['teamName']
        if not team_name:
            continue
        filtered_teams = teams[teams.apply(lambda row: row.astype(str).str.contains(team_name, case=False, na=False).any(), axis=1)].iloc[0]
        team_id = filtered_teams['id']
        if team_id not in team_rosters:
            team_roster_endpoint_url = f'https://statsapi.mlb.com/api/v1/teams/{team_id}/roster?season={season}'
            print(f'team id: {season}')
            team_rosters[team_id] = process_endpoint_url(team_roster_endpoint_url, 'roster')
        team_roster = team_rosters[team_id]
        players_involved = []
        # print(filtered_teams)
        for player in players_data:
            if player['playerName'] in team_roster['person_fullName'].values:
                player_id = team_roster[team_roster['person_fullName'].str.contains(player['playerName'])].iloc[0].to_dict()['person_id']
                players_involved.append({'id': player_id, 'name': player['playerName']})
        filtered_teams['players'] = players_involved
        filtered_teams['logo'] = f'https://www.mlbstatic.com/team-logos/{team_id}.svg'
        teams_.append(filtered_teams.to_dict())
        print(teams_)

    return teams_


def get_bat_speed(video_url):
    get_bat_speed_system_prompt = '''
    You are a multimodal system that analyzes videos of baseball at 1 frame per second. Get the frame where the pitcher hits the ball and a few frames before and after.
    Your job is to identify the bat speed of the player shown on the strike zone.
    Not the Exit Velocity.
    Add the type of ball thrown in the video to the response. (Fastball, Curveball, Slider, Changeup, Sinker, Cutter, Knuckleball, Splitter, Two-Seam Fastball, Four-Seam Fastball, Palm Ball, Screwball, or Eephus.)
    First crop in to the middle of the video and look at the number in the strike zone after the box, right after the batter strikes the ball and return it...
    Use both the video and audio streams to piece together the required data
    The bat speed is usually located along side a dot, right after the hit...
    '''

    class BatSpeedSchema(typing.TypedDict):
        batSpeed: int
        ballType: str

    get_bat_speed_config = genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=BatSpeedSchema,
        temperature=0
    )

    path = "video.mp4"
    if not video_url:
        return []

    def download_video(url, output_path):
        try:
            subprocess.run(['wget', url, '-O', output_path], check=True)
        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"Failed to download video: {e}"}), 500

    # Download the main video
    download_thread = threading.Thread(target=download_video, args=(video_url, path))
    download_thread.start()
    download_thread.join()

    video_file = genai.upload_file(path=path)

    # Wait until the uploaded video is available
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500

    model = genai.GenerativeModel(model_name="models/gemini-2.0-flash-exp",
                                  system_instruction=get_bat_speed_system_prompt,
                                  generation_config=get_bat_speed_config)

    # Prepare the input for the model
    inputs = ["input: ", video_file]

    response = model.generate_content(inputs)
    result_data = json.loads(response.text)
    print(response.text)
    os.remove(path)

    return result_data


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
            if not isinstance(embeddings, list) or not embeddings or not isinstance(embeddings[0], list):
                return [[] for _ in range(len(input))]
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
    sort_by = request.args.get('sortBy', 'ExitVelocity').strip('"').strip("'")  # Default sort by ExitVelocity
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('pageSize', 10))

    # Fetch all documents
    documents = hr_db.get()["metadatas"]

    # Filter documents based on search and where clauses
    filtered_documents = []
    for doc in documents:
        if search and search.lower() not in doc['title'].lower():
            continue
        if season and doc['season'] != season:
            continue
        if launch_angle and str(doc['LaunchAngle']) != launch_angle:
            continue
        if exit_velocity and str(doc['ExitVelocity']) != exit_velocity:
            continue
        if hit_distance and str(doc['HitDistance']) != hit_distance:
            continue
        filtered_documents.append(doc)

    # Sort documents based on the sort_by parameter
    sorted_documents = sorted(filtered_documents, key=lambda x: x.get(sort_by, 0), reverse=True)

    # Apply pagination
    start = (page - 1) * page_size
    end = start + page_size
    paginated_documents = sorted_documents[start:end]

    _data = []
    for doc in paginated_documents:
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
def home_run():
    hr_db = chroma_client.get_collection(name="mlb_hrs_001", embedding_function=GeminiEmbeddingFunction())
    documents = hr_db.get()["metadatas"]
    query_text = request.args.get('playId', '').strip('"').strip("'")
    page = int(request.args.get('page', 1))
    page_size = int(request.args.get('pageSize', 10))

    _data = []
    if query_text:
        filtered_documents = [doc for doc in documents if doc.get('play_id') == query_text]
        start = (page - 1) * page_size
        end = start + page_size
        paginated_documents = filtered_documents[start:end]

        for doc in paginated_documents:
            _data.append(dict({
                'title': doc['title'],
                'ExitVelocity': doc['ExitVelocity'],
                'LaunchAngle': doc['LaunchAngle'],
                'HitDistance': doc['HitDistance'],
                'video': doc['video'],
                'season': doc['season'],
                'play_id': doc['play_id']
            }))

    return jsonify(_data)

@app.route('/getPlayers', methods=["GET"])
def get_players():
    video_url=request.args.get('videoUrl', '').strip("'").strip('"')
    return jsonify(get_players_seen(video_url))


@app.route('/getTeams', methods=["GET"])
def get_teams_():
    video_url=request.args.get('videoUrl', '').strip("'").strip('"')
    season = request.args.get('season', '').strip("'").strip('"')
    return jsonify(get_teams(video_url,season))

@app.route('/getPlayExplanation', methods=["GET"])
def get_play():
    video_url=request.args.get('videoUrl', '').strip("'").strip('"')
    return jsonify(get_play_explanation(video_url))

@app.route('/translate', methods=["GET"])
def translate():
    text = request.args.get('text', '').strip("'").strip('"')
    lang = request.args.get('lang', '').strip("'").strip('"')
    return jsonify(get_translation(text, lang))

@app.route('/getBatSpeed', methods=["GET"])
def get_bat_speed_():
    video_url=request.args.get('videoUrl', '').strip("'").strip('"')
    return jsonify(get_bat_speed(video_url))

@app.route('/summary', methods=["GET"])
def summary():
    video_url=request.args.get('videoUrl', '').strip("'").strip('"')
    return jsonify(get_video_summary(video_url))

@app.route('/generate_hr_data', methods=['GET'])
def generate_hr_data():
    _data=[]
    hr_db = create_chroma_db(hr_documents, hr_ids, hr_metadatas, name='mlb_hrs_001')
    return jsonify(dict(hr_db.get_model()))

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False ,host= "0.0.0.0", port=9000,)