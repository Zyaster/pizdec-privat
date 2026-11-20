#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export JAVA_HOME="/home/zyaster/.gemini/antigravity/scratch/jdk-21"
export PATH="$JAVA_HOME/bin:$PATH"

SDK_ROOT="/home/zyaster/Android/Sdk"
BUILD_TOOLS="$SDK_ROOT/build-tools/34.0.0"
PLATFORM="$SDK_ROOT/platforms/android-34"
ANDROID_JAR="$PLATFORM/android.jar"

AAPT2="$BUILD_TOOLS/aapt2"
D8="$BUILD_TOOLS/d8"
ZIPALIGN="$BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS/apksigner"

BUILD_DIR="$PROJECT_ROOT/build"
OUT_DIR="$PROJECT_ROOT/bin"
RELEASE_DIR="$PROJECT_ROOT/release"

mkdir -p "$BUILD_DIR/compiled_res" "$BUILD_DIR/classes" "$BUILD_DIR/gen" "$OUT_DIR" "$RELEASE_DIR"

echo "==> 1. Compiling Android Resources with AAPT2..."
"$AAPT2" compile --dir "$PROJECT_ROOT/app/src/main/res" -o "$BUILD_DIR/compiled_res.zip"

echo "==> 2. Linking Resources & Generating R.java..."
"$AAPT2" link "$BUILD_DIR/compiled_res.zip" \
  -I "$ANDROID_JAR" \
  --manifest "$PROJECT_ROOT/app/src/main/AndroidManifest.xml" \
  --java "$BUILD_DIR/gen" \
  -o "$BUILD_DIR/resources.apk" \
  --auto-add-overlay

echo "==> 3. Compiling Java Source Files..."
mapfile -d '' JAVA_SOURCES < <(find "$PROJECT_ROOT/app/src/main/java" "$BUILD_DIR/gen" -name "*.java" -print0)
javac -source 8 -target 8 \
  -bootclasspath "$ANDROID_JAR" \
  -cp "$ANDROID_JAR" \
  -d "$BUILD_DIR/classes" \
  "${JAVA_SOURCES[@]}"

echo "==> 4. Converting Bytecode to DEX with D8..."
mapfile -d '' CLASS_FILES < <(find "$BUILD_DIR/classes" -name "*.class" -print0)
"$D8" --lib "$ANDROID_JAR" \
  --output "$BUILD_DIR" \
  "${CLASS_FILES[@]}"

echo "==> 5. Building Unaligned APK with Assets and DEX..."
cp "$BUILD_DIR/resources.apk" "$BUILD_DIR/unaligned.apk"
cd "$BUILD_DIR"
jar -uf "$BUILD_DIR/unaligned.apk" classes.dex
cd "$PROJECT_ROOT/app/src/main"
jar -uf "$BUILD_DIR/unaligned.apk" assets

echo "==> 6. Aligning APK with zipalign..."
"$ZIPALIGN" -f -p 4 "$BUILD_DIR/unaligned.apk" "$OUT_DIR/RomFlasherSimulator-unaligned.apk"

echo "==> 7. Generating Debug Keystore if needed..."
KEYSTORE="$PROJECT_ROOT/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkey -v -keystore "$KEYSTORE" -alias debugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=AndroidDebug,O=Android,C=US"
fi

echo "==> 8. Signing APK with apksigner..."
FINAL_APK="$RELEASE_DIR/RomFlasherSimulator.apk"
"$APKSIGNER" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:android \
  --ks-key-alias debugkey \
  --key-pass pass:android \
  --out "$FINAL_APK" \
  "$OUT_DIR/RomFlasherSimulator-unaligned.apk"

cp "$FINAL_APK" "$PROJECT_ROOT/RomFlasherSimulator.apk"

echo "==> 9. Verifying signed APK..."
"$APKSIGNER" verify "$FINAL_APK"

echo "=========================================================="
echo "🎉 APK Successfully Built and Signed!"
echo "Location: $FINAL_APK"
echo "Root Location: $PROJECT_ROOT/RomFlasherSimulator.apk"
echo "=========================================================="
