import json
import subprocess
import os
import time
import typing
from dotenv import load_dotenv
from flask import jsonify, request
from app import app
import google.generativeai as genai

import threading

from app.util.ai_interface import Gemini
from app.util.utilities import process_endpoint_url

# Load environment variables from .env file
load_dotenv()
# Load API key from environment variable
api_key = os.environ.get("GENAI_API_KEY")
if not api_key:
    raise ValueError("API key not found. Please set the GENAI_API_KEY environment variable.")
#prompt for summaries
summary_system_prompt = """
You are a baseball analysis system that only returns user-friendly 
information about baseball games, that are provided.
Your job is to breakdown the play and/or video and tell the user what happened in the game..
Return:{
summary: str(contains English text),
}
"""
# summary schema
class SummarySchema(typing.TypedDict):
    summary: str
#summary config
summary_config=genai.GenerationConfig(
    response_mime_type="application/json",
    response_schema=SummarySchema
)

#prompt for analysis
analysis_system_prompt = """
You are a baseball analysis system that provides detailed and 
structured information about baseball games. 
Your job is to analyze the provided 
video and extract key details about the game, including player statistics, game events, 
and environmental conditions. Return the information in the following structured format. 
Give them in details. Always return all the data in the schema. If the data is missing, give "none" as the return value.
You analyze the provided baseball video at 1 frame per second and extract key details.

Return:
{
  "pitchSpeed": "Speed of the pitch in miles per hour or kilometers per hour",
  "inningNumber": "The inning number in which the event occurred",
  "pitcher": "Name of the pitcher",
  "batter": "Name of the batter",
  "catcher": "Name of the catcher",
  "batSpeed": "Speed of the bat during the swing",
  "sprintSpeed": "Speed of the player running",
  "hardHit": "Indicator if the ball was hit hard",
  "pitchMovement": "Description of the pitch movement",
  "spinRate": "Spin rate of the pitch in revolutions per minute",
  "playDescription": "Description of the play",
  "playerNames": ["List of player names involved in the play"],
  "gameScore": "Current score of the game",
  "gameTime": "Time of the game",
  "weatherConditions": "Weather conditions during the game",
  teamNames: ["List of team names involved in the play"]
  score: "Current score of the game"
}

e.g:
{
  "pitchSpeed": "91 mph",
  "pitcher": "none",
  "playDescription": "John Jaso hits a home run to right center field.",
  "playerNames": ["John Jaso", "Roman Quinn"],
  "sprintSpeed": "none",
   "weatherConditions": "none",
    "teamName":["PIT","PHI"],
    "score":["2","1"]

  }

"""
#analysis schema
class BaseballVideoSchema(typing.TypedDict):
    pitchSpeed: str  # Speed of the pitch in miles per hour or kilometers per hour
    inningNumber: str  # The inning number in which the event occurred
    pitcher: str  # Name of the pitcher
    batter: str  # Name of the batter
    catcher: str  # Name of the catcher
    batSpeed: str  # Speed of the bat during the swing
    sprintSpeed: str  # Speed of the player running
    hardHit: str  # Indicator if the ball was hit hard
    pitchMovement: str  # Description of the pitch movement
    spinRate: str  # Spin rate of the pitch in revolutions per minute
    popTime: str  # Time taken for the catcher to throw the ball to a base
    exitVelocity: str  # Speed of the ball after it is hit
    launchAngle: str  # Angle at which the ball leaves the bat
    playDescription: str  # Description of the play
    playerNames: typing.List[str]  # List of player names involved in the play
    gameScore: str  # Current score of the game
    gameTime: str  # Time of the game
    weatherConditions: str  # Weather conditions during the game
    teamName: typing.List[str]  # List of team names involved in the play
    score: typing.List[str]  # Current score of the game



#analysis config
analysis_config=genai.GenerationConfig(
    response_mime_type="application/json",
    response_schema=BaseballVideoSchema
)









genai.configure(api_key=api_key)



@app.route('/summarize-video', methods=['GET'])
def summarize_video():
    path = "video.mp4"
    video_url = request.args.get('videoUrl', '').strip("'").strip('"')
    lang = request.args.get('lang', '').strip("'").strip('"')

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
        time.sleep(2)  # Reduced sleep time
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500

    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash",
                                  system_instruction=summary_system_prompt,
                                  generation_config=summary_config)

    response = model.generate_content(["give me highlights of the above game", video_file])
    result_text = json.loads(response.text)
    print(response.text)
    os.remove(path)
    gemini = Gemini()

    if not lang or lang=="en":
        return jsonify({
            "summary": result_text["summary"],
        })
    else:
        return jsonify({
            "summary": gemini.generate_translation(result_text["summary"], lang),
        })

@app.route('/analyze-video', methods=['GET'])
def analyze_video():
    path = "video.mp4"
    video_url = request.args.get('videoUrl', '').strip("'").strip('"')
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

    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash",
                                  system_instruction=analysis_system_prompt,
                                  generation_config=analysis_config)

    response = model.generate_content(["Analyze the provided baseball video and extract key details.", video_file])
    result_data = json.loads(response.text)
    print(response.text)
    os.remove(path)

    return jsonify(result_data)


@app.route('/summarize-game', methods=['GET'])
def summarize_game():
    game_id = request.args.get('gameId', '')
    lang = request.args.get('lang', '').strip("'").strip('"')

    game_content_url = f"https://statsapi.mlb.com/api/v1.1/game/{game_id}/feed/live"
    game_content = process_endpoint_url(game_content_url, "liveData")
    print(game_content.to_csv())


    model = genai.GenerativeModel(model_name="models/gemini-1.5-pro",
                                  system_instruction= """
You are a baseball analysis system that only returns user-friendly 
information about baseball games, that are provided.
Your job is to breakdown the play and/or video and tell the user what happened in the game.

Return:{
summary: str(contains English text),
}
""",
                                  generation_config=summary_config)

    response = model.generate_content(["In a few paragraphs, summarize the game, per inning.Cite Scores",
                                       game_content.to_csv()])
    result_text = json.loads(response.text)
    print(response.text)




    return jsonify(result_text)



