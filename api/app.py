import os, requests

from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv(override=True)

app= Flask(__name__)

CORS_VAR = os.getenv('CORS','*')
CORS(app, resources={r"/*": {"origins": CORS_VAR}})  # Enable CORS for localhost:5773


@app.route('/')
@app.route('/api/healthcheck', methods=['GET'])
def status():
    status = [ { 'status': 'healthy' } ]
    return jsonify(status)

@app.route('/api/get-speech-token', methods=['GET'])
def get_speech_token():
    speech_key = os.getenv('SPEECH_KEY')
    speech_region = os.getenv('SPEECH_REGION')

    if speech_key == '' or speech_region == '':
        return 'You forgot to add your speech key or region to the .env file.', 400

    headers = {
        'Ocp-Apim-Subscription-Key': speech_key,
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try:
        token_response = requests.post(f'https://{speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken', headers=headers)
        #token_response.raise_for_status()
        return jsonify(token=token_response.text, region=speech_region)
    except requests.exceptions.RequestException as e:
        return 'There was an error authorizing your speech key.', 401





if __name__ == '__main__':
   app.run(debug=True, port=8000, host='0.0.0.0')