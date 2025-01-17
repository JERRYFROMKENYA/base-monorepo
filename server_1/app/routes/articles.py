from flask import jsonify, request
import numpy as np
import pandas as pd
from sympy import content

from app import app
from app.util.utilities import load_newline_delimited_json


@app.route('/articles', methods=['GET'])
def get_articles():
    mlb_fan_content_interaction_json_file = 'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/mlb-fan-content-interaction-data/mlb-fan-content-interaction-data-000000000000.json'
    mlb_fan_content_interaction_df = load_newline_delimited_json(mlb_fan_content_interaction_json_file)
    date_counts = mlb_fan_content_interaction_df['date_time_date'].value_counts()
    content_type_counts = (mlb_fan_content_interaction_df['content_type'].
                           value_counts())
    content_source_counts = (mlb_fan_content_interaction_df['source'].
                             value_counts())
    interaction_by_content = (mlb_fan_content_interaction_df[
                                  ['slug', 'content_type', 'content_headline']].
                              value_counts().
                              reset_index().
                              rename(columns={"count": "num_interactions"})
                              )
    return jsonify(interaction_by_content.to_dict(orient='records'))


@app.route('/articles/<content_type>/<slug>', methods=['GET'])
def get_article(slug="every-2024-mlb-trade-deadline-deal", content_type="article"):
    return jsonify({"url":f'https://www.mlb.com/{content_type}/{slug}'})
