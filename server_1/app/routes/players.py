import json

import pandas as pd
import requests
from flask import jsonify, request
from app import app
from app.util.utilities import process_endpoint_url, load_newline_delimited_json


@app.route('/players', methods=['GET'])
def get_players():
    season_year = request.args.get('season', '2025')
    key = request.args.get('q', '').strip('"').strip("'")
    teamId = request.args.get('teamId', '')
    playerId = request.args.get('playerId', '')
    players_endpoint_url = f'https://statsapi.mlb.com/api/v1/sports/1/players' + (
        f'?season={season_year}' if season_year else '')
    players = process_endpoint_url(players_endpoint_url, 'people')
    players = players.to_dict(orient='records')
    for player in players:
        player['link'] = f"https://statsapi.mlb.com{player['link']}"
        player['currentTeam_link'] = f"https://statsapi.mlb.com{player['currentTeam_link']}"
    if key:
        players = [player for player in players if
                            any(key.lower() in str(value).lower() for value in player.values())]

    if teamId:
        players = [player for player in players if player['currentTeam_id'] == int(teamId)]
    if playerId:
            players = [player for player in players if player['id'] == int(playerId)]



    return jsonify(players)

@app.route('/player_headshot', methods=['GET'])
def get_player_headshot():
    player_id = request.args.get('playerId', '')
    player_headshot_endpoint_url = f'https://securea.mlb.com/mlb/images/players/head_shot/{player_id}.jpg'
    player_headshot = player_headshot_endpoint_url
    return jsonify({
        "player_headshot":player_headshot
    })



@app.route('/play_video', methods=['GET'])
def get_play_video():
    play_id = request.args.get('playId', '')
    play_video_endpoint_url = f'https://www.mlb.com/video/search?q=playid="{play_id}"'

    return jsonify({
        "play_video": play_video_endpoint_url
    })


@app.route('/mlb_home_runs', methods=['GET'])
def get_mlb_home_runs():
    mlb_hr_csvs_list = [
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2016-mlb-homeruns.csv',
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2017-mlb-homeruns.csv',
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-mlb-homeruns.csv',
        'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/2024-postseason-mlb-homeruns.csv'
    ]
    mlb_hrs = pd.DataFrame({'csv_file': mlb_hr_csvs_list})
    # Extract season from the 'csv_file' column using regex
    mlb_hrs['season'] = mlb_hrs['csv_file'].str.extract(r'/datasets/(\d{4})')
    # Read CSV files and store data in the DataFrame
    mlb_hrs['hr_data'] = mlb_hrs['csv_file'].apply(pd.read_csv)
    # Add season column to each DataFrame
    for index, row in mlb_hrs.iterrows():
        hr_df = row['hr_data']
        hr_df['season'] = row['season']
    # Concatenate all DataFrames into a single DataFrame
    all_mlb_hrs = (pd.concat(mlb_hrs['hr_data'].tolist(), ignore_index=True)
                   [['season', 'play_id', 'title', 'ExitVelocity', 'LaunchAngle', 'HitDistance', 'video']])
    # Get the search key from query parameters
    search_key = request.args.get('q', '').strip('"').strip("'")
    # Filter the DataFrame based on the search key
    if search_key:
        filtered_hrs = all_mlb_hrs[all_mlb_hrs.apply(lambda row: row.astype(str).str.contains(search_key, case=False, na=False).any(), axis=1)]
        return jsonify(filtered_hrs.to_dict(orient='records'))
    return jsonify(all_mlb_hrs.to_dict(orient='records'))


@app.route('/mlb_fan_favorites', methods=['GET'])
def get_mlb_fan_favorites():
    mlb_fan_favorites_json_file = 'https://storage.googleapis.com/gcp-mlb-hackathon-2025/datasets/mlb-fan-content-interaction-data/2025-mlb-fan-favs-follows.json'
    mlb_fan_favorites_df = load_newline_delimited_json(mlb_fan_favorites_json_file)

    # Convert favorite team ID to integer format
    mlb_fan_favorites_df['favorite_team_id'] = mlb_fan_favorites_df['favorite_team_id'].astype('Int64')

    # Expand followed team IDs
    mlb_fan_follows_expanded_df = mlb_fan_favorites_df.explode('followed_team_ids').reset_index(drop=True)
    mlb_fan_follows_expanded_df['followed_team_ids'] = mlb_fan_follows_expanded_df['followed_team_ids'].astype('Int64')

    # Get most followed teams
    teams_endpoint_url = 'https://statsapi.mlb.com/api/v1/teams'
    teams = process_endpoint_url(teams_endpoint_url, 'teams')
    most_followed_teams = pd.merge(
        mlb_fan_follows_expanded_df['followed_team_ids'].value_counts().reset_index().rename(columns={"count": "num_followers"}),
        teams[['id', 'name']].rename(columns={"id": "team_id", "name": "team_name"}),
        left_on='followed_team_ids',
        right_on='team_id',
        how='left'
    )[['team_id', 'team_name', 'num_followers']]

    # Expand followed player IDs
    mlb_fan_followed_players_expanded_df = mlb_fan_favorites_df.explode('followed_player_ids').reset_index(drop=True)
    mlb_fan_followed_players_expanded_df['followed_player_ids'] = mlb_fan_followed_players_expanded_df['followed_player_ids'].astype('Int64')

    # Get most followed players
    players_endpoint_url = 'https://statsapi.mlb.com/api/v1/sports/1/players'
    players = process_endpoint_url(players_endpoint_url, 'people')
    most_followed_players = pd.merge(
        mlb_fan_followed_players_expanded_df['followed_player_ids'].value_counts().reset_index().rename(columns={"followed_player_ids": "player_id", "count": "num_followers"}),
        players[['id', 'nameFirstLast']].rename(columns={"id": "player_id", "nameFirstLast": "player_name"}),
        on='player_id',
        how='left'
    ).nlargest(50, 'num_followers')

    return jsonify({
        "most_followed_teams": most_followed_teams.to_dict(orient='records'),
        "most_followed_players": most_followed_players.to_dict(orient='records')
    })


@app.route('/all_teams_and_players', methods=['GET'])
def get_all_teams_and_players():
    # Fetch all teams
    teams_endpoint_url = 'https://statsapi.mlb.com/api/v1/teams'
    teams = process_endpoint_url(teams_endpoint_url, 'teams')

    # Fetch all players
    players_endpoint_url = 'https://statsapi.mlb.com/api/v1/sports/1/players'
    players = process_endpoint_url(players_endpoint_url, 'people')

    # Prepare teams data
    all_teams_data = []
    for team in teams.to_dict(orient='records'):
        team_id = team['id']
        team_data = {
            'team_id': team_id,
            'team_name': team['name'],
            'num_followers': 0  # Placeholder for followers count
        }
        all_teams_data.append(team_data)

    # Prepare players data
    all_players_data = []
    for player in players.to_dict(orient='records'):
        player_id = player['id']
        player_data = {
            'player_id': player_id,
            'player_name': player['nameFirstLast'],
            'num_followers': 0  # Placeholder for followers count
        }
        all_players_data.append(player_data)

    return jsonify({
        "all_teams": all_teams_data,
        "all_players": all_players_data
    })