import json
import subprocess
import os
import time
import typing

# import cv2
# import matplotlib.pyplot as plt
from dotenv import load_dotenv
from flask import jsonify, request
from app import app
# from app.util.utilities import process_endpoint_url
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()
# Load API key from environment variable
api_key = os.environ.get("GENAI_API_KEY")
if not api_key:
    raise ValueError("API key not found. Please set the GENAI_API_KEY environment variable.")

summary_system_prompt = """
You are a baseball analysis system that only returns user-friendly 
information about baseball games, that are provided.
Your job is to breakdown the play and/or video and tell the user what happened in the game.
You return the same information in four different languages. English, Japanese, Spanish, and Swahili.
Return:{
en: str,
ja: str,
es: str,
sw: str,
}
"""
# summary schema
class SummarySchema(typing.TypedDict):
    en: str
    sw: str
    ja: str
    es: str
summary_config=genai.GenerationConfig(
    response_mime_type="application/json",
    response_schema=SummarySchema
)
analysis_system_prompt = """
You are a baseball analysis system that only data in a specific structured manner whose job is to provide highlights in videos,
You will also give name of players involved and also the statistics of the game.
return at least 17 sentences describing the game game.
Only return plain text.
"""

genai.configure(api_key=api_key)

@app.route('/summarize-video', methods=['GET'])
def summarize_video():
    path = "video.mp4"
    video_url = request.args.get('videoUrl', '').strip("'").strip('"')

    try:
        subprocess.run(['wget', video_url, '-O', path], check=True)
    except subprocess.CalledProcessError as e:
        return jsonify({"error": f"Failed to download video: {e}"}), 500

    video_file = genai.upload_file(path=path)

    # Wait until the uploaded video is available
    while video_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(5)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        return jsonify({"error": "Video processing failed"}), 500
    model = genai.GenerativeModel(model_name="models/gemini-1.5-pro",
                                  system_instruction=summary_system_prompt,
                                  generation_config=summary_config)



    response = model.generate_content(["give me highlights of the above game", video_file])
    result_text = json.loads(response.text)
    os.remove(path)

    return result_text

@app.route('/analyze-video', methods=['GET'])
def analyze_video():
    return jsonify({"message": "Analyze video endpoint not implemented yet"})


