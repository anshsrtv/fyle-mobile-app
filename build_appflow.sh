VERSION=`sentry-cli releases propose-version`
ionic capacitor build --prod --source-map
sentry-cli releases --org fyle-technologies-private-limi -p new-mobile-app-prod files "$VERSION" upload-sourcemaps www