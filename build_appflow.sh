VERSION=`sentry-cli releases propose-version`
ionic capacitor sync --prod --source-map
sentry-cli releases --org fyle-technologies-private-limi -p "$SENTRY_PROJECT_NAME" files "$VERSION" upload-sourcemaps www