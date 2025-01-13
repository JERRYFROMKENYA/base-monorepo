from flask import jsonify, request
from app import app
from app.util.utilities import process_endpoint_url

@app.route('/sports', methods=['GET'])
def get_sports():
    sport_id = request.args.get('sportId', '')
    sports_endpoint_url = f'https://statsapi.mlb.com/api/v1/sports' + (f'?sportId={sport_id}' if sport_id else '')  # Can add '?sportId=1' for MLB only
    sports = process_endpoint_url(sports_endpoint_url, 'sports')
    return jsonify(sports.to_dict(orient='records'))


@app.route('/leagues', methods=['GET'])
def get_leagues():
    sport_id = request.args.get('sportId', '')
    leagues_endpoint_url = f'https://statsapi.mlb.com/api/v1/league' + (f'?sportId={sport_id}' if sport_id else '')  # Can add '?sportId=1' for MLB leagues
    leagues = process_endpoint_url(leagues_endpoint_url, 'leagues')
    return jsonify(leagues.to_dict(orient='records'))


@app.route('/seasons', methods=['GET'])
def get_seasons():
    sport_id = request.args.get('sportId', '1')
    typeDates = request.args.get('type', True)
    seasons_endpoint_url = 'https://statsapi.mlb.com/api/v1/seasons/all' + (f'?sportId={sport_id}' if sport_id else f'?sportId=1') + (
        f'&withGameTypeDates=true' if typeDates else ''
    )  # Can add '?sportId=1' for MLB seasons
    seasons = process_endpoint_url(seasons_endpoint_url, 'seasons')
    return jsonify(seasons.to_dict(orient='records'))