from flask import Flask

app = Flask(__name__)

from app.routes import sports, teams, players, schedule, captions, predictions, video_analysis, articles