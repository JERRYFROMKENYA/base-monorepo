from flask import jsonify, request
from app import app
from app.util.utilities import process_endpoint_url

@app.route('/teams', methods=['GET'])
def get_teams():
    league_id = request.args.get('leagueId', '')
    search = request.args.get('q', '').strip('"').strip("'")
    teams_endpoint_url = f'https://statsapi.mlb.com/api/v1/teams'
    teams = process_endpoint_url(teams_endpoint_url, 'teams')
    if search:
        filtered_teams = teams[teams.apply(lambda row: row.astype(str).str.contains(search, case=False, na=False).any(), axis=1)]
        filtered_teams['logo'] = filtered_teams['id'].apply(lambda team_id: f'https://www.mlbstatic.com/team-logos/{team_id}.svg')
        return jsonify(filtered_teams.to_dict(orient='records'))

    teams_endpoint_url = f'https://statsapi.mlb.com/api/v1/teams' + (f'?leagueId={league_id}' if league_id else '')
    teams = process_endpoint_url(teams_endpoint_url, 'teams')
    teams['logo'] = teams['id'].apply(lambda team_id: f'https://www.mlbstatic.com/team-logos/{team_id}.svg')

    return jsonify(teams.to_dict(orient='records'))

@app.route('/team', methods=['GET'])
def get_team():
    team_id = request.args.get('teamId', '')
    team_endpoint_url = f'https://statsapi.mlb.com/api/v1/teams/{team_id}'
    team = process_endpoint_url(team_endpoint_url, 'teams')
    team['logo']=f'https://www.mlbstatic.com/team-logos/{team_id}.svg'
    return jsonify(team.to_dict(orient='records'))


@app.route('/team_roster', methods=['GET'])
def get_team_roster():
    team_id = request.args.get('teamId', '')
    season_year = request.args.get('season', '2025')
    team_roster_endpoint_url = f'https://statsapi.mlb.com/api/v1/teams/{team_id}/roster' + (
        f'?season={season_year}' if season_year else '')
    team_roster = process_endpoint_url(team_roster_endpoint_url, 'roster')
    # Modify the 'person_link' to be a full URL
    full_roster = []
    for player in team_roster.to_dict(orient='records'):
        player['person_link'] = f"https://statsapi.mlb.com{player['person_link']}"
        full_roster.append(player)

    return jsonify(full_roster)