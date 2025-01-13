from flask import jsonify, request
from app import app
from app.util.utilities import process_endpoint_url

@app.route('/schedule', methods=['GET'])
def get_schedule():
    sports_id = request.args.get('sportId', '1')
    season = request.args.get('season', '2025')
    search_key = request.args.get('q', '').strip('"').strip("'")

    schedule_endpoint_url = f'https://statsapi.mlb.com/api/v1/schedule' + (
        f'?sportId={sports_id}&season={season}' if sports_id and season else '')
    schedule = process_endpoint_url(schedule_endpoint_url, 'dates')

    full_schedule = schedule.to_dict(orient='records')

    filtered_schedule = []
    for day in full_schedule:
        filtered_games = []
        for game in day.get('games', []):
            game['link'] = f"https://statsapi.mlb.com{game['link']}"
            if 'content' in game and 'link' in game['content']:
                game['content']['link'] = f"https://statsapi.mlb.com{game['content']['link']}"
            if 'teams' in game:
                for team_type in ['home', 'away']:
                    team = game['teams'].get(team_type, {})
                    if 'team' in team and 'link' in team['team']:
                        team['team']['link'] = f"https://statsapi.mlb.com{team['team']['link']}"
            if 'venue' in game and 'link' in game['venue']:
                game['venue']['link'] = f"https://statsapi.mlb.com{game['venue']['link']}"

            if search_key:
                if (search_key.lower() in game.get('venue', {}).get('name', '').lower() or
                        search_key.lower() in game.get('teams', {}).get('home', {}).get('team', {}).get('name', '').lower() or
                        search_key.lower() in game.get('teams', {}).get('away', {}).get('team', {}).get('name', '').lower()):
                    filtered_games.append(game)
            else:
                filtered_games.append(game)

        if filtered_games:
            filtered_day = day.copy()
            filtered_day['games'] = filtered_games
            filtered_schedule.append(filtered_day)

    return jsonify(filtered_schedule)