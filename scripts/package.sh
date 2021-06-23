#!/usr/bin/env bash

if [[ -n $1 ]]; then
  cd ./resources
  npm version -git-tag-version=false --allow-same-version $1
  cd ..
  npm version -git-tag-version=false --allow-same-version $1
fi

npm run build

./node_modules/.bin/electron-builder -m

docker run --rm -ti \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
 --env ELECTRON_CACHE="/root/.cache/electron" \
 --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
 -v "${PWD}":/project \
 -v "${PWD##*/}"-node-modules:/project/node_modules \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine@sha256:b44981dcdc60192ba3f898042fc2a21f2bd7bb626dc66382e7dcdb2e3add38af \
 /bin/bash -c "npm install && ./node_modules/.bin/electron-builder -wl"
