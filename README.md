# 1. Make sure you're logged in
eas login

# 2. Update version if needed (using your bump script, overwrites android/app/build.gradle and ios/nhungnails2024/Info.plist)
npm run bump-version 2.0.4

# 3. Build and submit to TestFlight
npm run publish-ios

# OR do it step by step:
eas build --platform ios --profile production

# Wait for build to complete, then:
eas submit --platform ios --latest

preview: Internal distribution (TestFlight internal testing)
production: App Store distribution (TestFlight external testing + App Store)