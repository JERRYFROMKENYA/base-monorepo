from flask import jsonify, request
from app import app
from app.util.utilities import process_endpoint_url

def paginate(data, page, per_page):
    start = (page - 1) * per_page
    end = start + per_page
    return data[start:end]

@app.route('/sports', methods=['GET'])
def get_sports():
    sport_id = request.args.get('sportId', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    sports_endpoint_url = f'https://statsapi.mlb.com/api/v1/sports' + (f'?sportId={sport_id}' if sport_id else '')
    sports = process_endpoint_url(sports_endpoint_url, 'sports')
    paginated_sports = paginate(sports.to_dict(orient='records'), page, per_page)
    return jsonify(paginated_sports)

@app.route('/leagues', methods=['GET'])
def get_leagues():
    sport_id = request.args.get('sportId', '')
    league_id = request.args.get('leagueId', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    leagues_endpoint_url = f'https://statsapi.mlb.com/api/v1/league' + (f'?sportId={sport_id}' if sport_id else '')
    leagues = process_endpoint_url(leagues_endpoint_url, 'leagues')
    leagues = leagues[leagues['id'] == int(league_id)] if league_id else leagues
    paginated_leagues = paginate(leagues.to_dict(orient='records'), page, per_page)
    return jsonify(paginated_leagues)

@app.route('/seasons', methods=['GET'])
def get_seasons():
    sport_id = request.args.get('sportId', '1')
    typeDates = request.args.get('type', True)
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    seasons_endpoint_url = 'https://statsapi.mlb.com/api/v1/seasons/all' + (f'?sportId={sport_id}' if sport_id else f'?sportId=1') + (
        f'&withGameTypeDates=true' if typeDates else ''
    )
    seasons = process_endpoint_url(seasons_endpoint_url, 'seasons')
    paginated_seasons = paginate(seasons.to_dict(orient='records'), page, per_page)
    return jsonify(paginated_seasons)