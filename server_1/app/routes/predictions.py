from flask import jsonify, request
from google.cloud import aiplatform
from google.oauth2 import service_account
from app import app

# credentials = service_account.Credentials.from_service_account_file('app/util/.service/server1.json')
# client_options = {"api_endpoint": "us-central1-aiplatform.googleapis.com"}
# vertex_ai_client = aiplatform.gapic.PredictionServiceClient(client_options=client_options, credentials=credentials)

@app.route('/predict_player_performance', methods=['POST'])
def predict_player_performance():
    data = request.json
    instances = [data]
    endpoint = "projects/your-project-id/locations/us-central1/endpoints/your-endpoint-id"
    response = vertex_ai_client.predict(endpoint=endpoint, instances=instances)
    predictions = response.predictions
    return jsonify(predictions)