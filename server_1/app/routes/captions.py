from flask import jsonify, request
import numpy as np
import pandas as pd
from app import app
from app.util.utilities import load_newline_delimited_json

@app.route('/captions', methods=['GET'])
def get_captions():
    mlb_captions_base_url = 'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/mlb-caption-data/mlb-captions-data-*.json'
    all_dfs = []
    for i in np.arange(0, 13):
        this_url = mlb_captions_base_url.replace("*", str(i).zfill(12))
        this_df = load_newline_delimited_json(this_url)
        all_dfs.append(this_df)
    mlb_captions_df = pd.concat(all_dfs, ignore_index=True)
    game_pk = request.args.get('gamePk', '')
    search_key = request.args.get('q', '').strip('"').strip("'")
    if game_pk:
        mlb_captions_df = mlb_captions_df[mlb_captions_df['game_pk'] == game_pk]
    if search_key:
        mlb_captions_df = mlb_captions_df[mlb_captions_df['caption_text'].str.contains(search_key, case=False, na=False)]
    return jsonify(mlb_captions_df.to_dict(orient='records'))