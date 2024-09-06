#!/bin/bash

# Input arguments
RESOURCE_GROUP=Telus
WEB_APP_NAME=scibe-api

echo "Settings"
#az webapp config set --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME \
#                    --startup-file "python app.py --port 8000 --host 0.0.0.0"


pushd ../api

echo "create ZIP file"
zip -r *  -x **__pycache__\* 

echo "ZIP Deploy"
az webapp deploy --resource-group $RESOURCE_GROUP  --name $WEB_APP_NAME --src-path deploy.zip

popd

echo "Setup complete."