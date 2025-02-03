import json

import requests
from flask import jsonify, request
from app import app
from app.util.utilities import process_endpoint_url

@app.route('/schedule', methods=['GET'])
def get_schedule():
    sports_id = request.args.get('sportId', '1')
    season = request.args.get('season', '2025')
    search_key = request.args.get('q', '').strip('"').strip("'")
    team_id= request.args.get('teamId', '')
    game_pk = request.args.get('gamePk', '')
    game_pks = request.args.get('gamePks', '')
    start_date = request.args.get('startDate', '')
    end_date = request.args.get('endDate', '')

    schedule_endpoint_url = f'https://statsapi.mlb.com/api/v1/schedule' + (
        f'?sportId={sports_id}&season={season}' if sports_id and season else '') + (
        f'&teamId={team_id}' if team_id else '') +(
        f'&gamePk={game_pk}' if game_pk else '') + (
        f'&gamePks=[{game_pks}]' if game_pks else '') + (
        f'&startDate={start_date}' if start_date else '') + (
        f'&endDate={end_date}' if end_date else '')
    print(schedule_endpoint_url)
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

    print(len(filtered_schedule))

    return jsonify(filtered_schedule)




def get_content(game_id):
    game_content_url = f"https://statsapi.mlb.com/api/v1/game/{game_id}/content"
    # game_content = json.loads(requests.get(game_content_url).content)
    #editorial
    editorial=process_endpoint_url(game_content_url,"editorial")
    #media
    media= process_endpoint_url(game_content_url,"media")
    #highlights
    highlights= process_endpoint_url(game_content_url,"highlights")
    #summary
    summary= process_endpoint_url(game_content_url,"summary")

    return {
        "editorial": editorial.to_dict(orient='records'),
        "media": media.to_dict(orient='records'),
        "highlights": highlights.to_dict(orient='records'),
        "summary": summary.to_dict(orient='records')
    }


def get_feed(game_id):
    game_endpoint_url = f'https://statsapi.mlb.com/api/v1.1/game/{game_id}/feed/live'
    game_content = json.loads(requests.get(game_content_url).content)
    #editorial
    process_endpoint_url(game_content_url,"editorial")
    #media
    process_endpoint_url(game_content_url,"media")
    #highlights
    process_endpoint_url(game_content_url,"highlights")
    #summary
    process_endpoint_url(game_content_url,"summary")

    return {
        "editorial": game_content["editorial"].to_dict(orient='records'),
        "media": game_content["media"].to_dict(orient='records'),
        "highlights": game_content["highlights"].to_dict(orient='records'),
        "summary": game_content["summary"].to_dict(orient='records')
    }

@app.route('/game', methods=['GET'])
def get_game():
    # gamePk
    game_id = request.args.get('gameId', '')
    game_endpoint_url = f'https://statsapi.mlb.com/api/v1.1/game/{game_id}/feed/live'
    game = json.loads(requests.get(game_endpoint_url).content)
    current_play=request.args.get('currentPlay', '')
    # Extract single play information
    game_content = get_content(game_id)

    if not current_play:
        return jsonify({
            # "feed":game,
                        "content":game_content})

    single_game_play = game['liveData']['plays'].get('currentPlay')
    if single_game_play is None:
        # If 'currentPlay' is not found, try accessing the last play in 'allPlays'
        all_plays = game['liveData']['plays'].get('allPlays')
        if all_plays:
            single_game_play = all_plays[-1]  # Get the last play
        else:
            single_game_play = {}  # Set to empty dictionary if no plays are found
            print("No plays found for this game.")
    return jsonify(single_game_play)



