import os
import requests
import base64
import json

from flask import Flask, jsonify, request, abort
from dotenv import load_dotenv
from flask_cors import CORS
from notes import send_transcription_to_prompty, send_note_to_prompty

# Load environment variables from .env file
load_dotenv(override=True)

app = Flask(__name__)

# Set CORS environment variable
CORS_VAR = os.getenv('CORS', '*')
CORS(app, resources={
      r"/*": {
          "origins": CORS_VAR,
          "methods": ["GET", "POST", "OPTIONS"],
          "allow_headers": ["Content-Type", "Authorization"],
          "supports_credentials": True
      }
  }) # Enable CORS 

###
# Helper function to decode the client principal
###
def get_authenticated_user():
    client_principal = request.headers.get('X-MS-CLIENT-PRINCIPAL')
    if client_principal:
        # Base64-decode the client principal
        decoded = base64.b64decode(client_principal)
        # Parse the JSON data
        client_principal_data = json.loads(decoded)
        return client_principal_data
    else:
        return None

###
# Enforce authentication on protected routes
###
@app.before_request
def require_authentication():
    # List of paths that do not require authentication
    exempt_paths = ['/', '/api/healthcheck']
    if request.path in exempt_paths:
        # Allow unauthenticated access to exempt paths
        return
    user = get_authenticated_user()
    if not user:
        return abort(401, description="Unauthorized")

###
# Healthcheck endpoint (does not require authentication)
###
@app.route('/')
@app.route('/api/healthcheck', methods=['GET'])
def status():
    status = [{'status': 'healthy'}]
    return jsonify(status)

###
# Get the speech token from the Azure Speech Service
###
@app.route('/api/get-speech-token', methods=['GET'])
def get_speech_token():
    speech_key = os.getenv('SPEECH_KEY')
    speech_region = os.getenv('SPEECH_REGION')

    if not speech_key or not speech_region:
        return 'You forgot to add your speech key or region to the .env file.', 400

    headers = {
        'Ocp-Apim-Subscription-Key': speech_key,
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try:
        token_response = requests.post(
            f'https://{speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken', headers=headers)
        # Return the speech token and region
        return jsonify(token=token_response.text, region=speech_region)
    except requests.exceptions.RequestException as e:
        return 'There was an error authorizing your speech key.', 401

###
# Run Prompty OpenAPI: summarize transcription of conversation
###
@app.route('/api/generate-doc', methods=['POST'])
def generate_doc():
    try:
        data = request.json
        print("Received data for generate-doc:", data)

        # Access authenticated user information if needed
        user = get_authenticated_user()
        # Example: Get the user's email address
        user_email = None
        if user:
            for claim in user['claims']:
                if claim['typ'] == 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':
                    user_email = claim['val']
                    break

        # Call your function with the received data
        note = send_transcription_to_prompty(
            data['transcription'], data['language'])
        return jsonify(soap_note=note)
    except Exception as e:
        print(f"Error in generate-doc: {e}")
        return str(e), 400

###
# Run Prompty OpenAPI: generate handout from SOAP note
###
@app.route('/api/generate-handout', methods=['POST'])
def generate_handout():
    try:
        data = request.json
        print("Received data for generate-handout:", data)

        # Access authenticated user information if needed
        user = get_authenticated_user()
        # Example: Get the user's email address
        user_email = None
        if user:
            for claim in user['claims']:
                if claim['typ'] == 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':
                    user_email = claim['val']
                    break

        # Call your function with the received data
        handout = send_note_to_prompty(data['soap_note'], data['language'])
        return jsonify(handout=handout)
    except Exception as e:
        print(f"Error in generate-handout: {e}")
        return str(e), 400

###
# Debug endpoint to display headers (for testing purposes)
# Remove or protect this endpoint before deploying to production
###
@app.route('/api/headers', methods=['GET'])
def headers():
    user = get_authenticated_user()
    if user:
        return jsonify(user)
    else:
        return abort(401, description="Unauthorized")

if __name__ == '__main__':
    app.run(debug=True, port=8000, host='0.0.0.0')