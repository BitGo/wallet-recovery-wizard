#!/usr/bin/env bash

PKG_VERSION=$(npm pkg get version | sed 's/"//g')
DEB_PATH="release/$PKG_VERSION/Wallet Recovery Wizard-Linux-$PKG_VERSION.deb"
EXE_PATH="release/$PKG_VERSION/Wallet Recovery Wizard-Setup-$PKG_VERSION.exe"
DMG_PATH="release/$PKG_VERSION/Wallet Recovery Wizard-$PKG_VERSION.dmg"

if [ ! -f "$DEB_PATH" ]; then
  echo "Error: $DEB_PATH does not exist"
  echo "Please run ./scripts/docker-build.sh on a MacOS machine to build the DEB"
  exit 1
fi

if [ ! -f "$EXE_PATH" ]; then
  echo "Error: $EXE_PATH does not exist"
  echo "Please run ./scripts/docker-build.sh on a MacOS machine to build the EXE"
  exit 1
fi

if [ ! -f "$DMG_PATH" ]; then
  echo "Error: $DMG_PATH does not exist"
  echo "Please run ./scripts/docker-build.sh on a MacOS machine to build the DMG"
  exit 1
fi

DEB_SHA=$(shasum -a 256 "$DEB_PATH" | cut -d ' ' -f 1)
EXE_SHA=$(shasum -a 256 "$EXE_PATH" | cut -d ' ' -f 1)
DMG_SHA=$(shasum -a 256 "$DMG_PATH" | cut -d ' ' -f 1)

echo "#### SHA-256 Hashes:"
echo "Linux(.deb): $DEB_SHA"
echo "MacOS(.dmg): $DMG_SHA"
echo "Windows(.exe): $EXE_SHA"
