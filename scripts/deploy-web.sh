#!/bin/bash

# Input arguments
RESOURCE_GROUP=Telus
WEB_APP_NAME=scribe-web

echo "set startup file"
az webapp config set --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME \
                    --startup-file "pm2 serve /home/site/wwwroot/dist --no-daemon --spa"

pushd ../web
npm run build

cho "create ZIP file"
zip -r deploy.zip  dist/*

echo "ZIP Deploy"
az webapp deploy --resource-group $RESOURCE_GROUP  --name $WEB_APP_NAME --src-path deploy.zip

popd

echo "Setup complete."