const fs = require('fs');
const path = require('path');

function updateVersion(newVersion) {
    console.log(`🔄 Updating to version ${newVersion}...`);

    // 1. Update package.json
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('✅ Updated package.json');

    // 2. Update app.json
    const appPath = path.join(__dirname, '..', 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appPath, 'utf8'));
    appJson.expo.version = newVersion;
    fs.writeFileSync(appPath, JSON.stringify(appJson, null, 2) + '\n');
    console.log('✅ Updated app.json');

    // 3. Update Android build.gradle
    const gradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
    let gradleContent = fs.readFileSync(gradlePath, 'utf8');

    // Extract current versionCode and increment it
    const versionCodeMatch = gradleContent.match(/versionCode (\d+)/);
    const currentVersionCode = parseInt(versionCodeMatch[1]);
    const newVersionCode = currentVersionCode + 1;

    gradleContent = gradleContent.replace(/versionCode \d+/, `versionCode ${newVersionCode}`);
    gradleContent = gradleContent.replace(/versionName "[^"]*"/, `versionName "${newVersion}"`);

    fs.writeFileSync(gradlePath, gradleContent);
    console.log(`✅ Updated Android (versionCode: ${newVersionCode}, versionName: ${newVersion})`);

    // 4. Update iOS Info.plist
    const plistPath = path.join(__dirname, '..', 'ios', 'nhungnails2024', 'Info.plist');
    let plistContent = fs.readFileSync(plistPath, 'utf8');

    // Extract current CFBundleVersion and increment it
    const bundleVersionMatch = plistContent.match(/<key>CFBundleVersion<\/key>\s*<string>(\d+)<\/string>/);
    const currentBundleVersion = parseInt(bundleVersionMatch[1]);
    const newBundleVersion = currentBundleVersion + 1;

    plistContent = plistContent.replace(
        /<key>CFBundleShortVersionString<\/key>\s*<string>[^<]*<\/string>/,
        `<key>CFBundleShortVersionString</key>\n    <string>${newVersion}</string>`
    );
    plistContent = plistContent.replace(
        /<key>CFBundleVersion<\/key>\s*<string>\d+<\/string>/,
        `<key>CFBundleVersion</key>\n    <string>${newBundleVersion}</string>`
    );

    fs.writeFileSync(plistPath, plistContent);
    console.log(`✅ Updated iOS (CFBundleShortVersionString: ${newVersion}, CFBundleVersion: ${newBundleVersion})`);

    console.log(`\n🎉 Successfully updated all files to version ${newVersion}!`);
    console.log(`📱 Android versionCode: ${newVersionCode}`);
    console.log(`🍎 iOS CFBundleVersion: ${newBundleVersion}`);
}

// Get version from command line argument
const newVersion = process.argv[2];
if (!newVersion) {
    console.error('❌ Please provide a version number: npm run bump-version 2.0.2');
    process.exit(1);
}

// Validate version format (basic semver check)
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('❌ Version must be in format X.Y.Z (e.g., 2.0.2)');
    process.exit(1);
}

updateVersion(newVersion);