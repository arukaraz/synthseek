#!/bin/sh
set -eu

if [ "$#" -ne 3 ]; then
  echo "Usage: bundle-release-notes.sh <web-root> <version> <output-folder>" >&2
  exit 2
fi

WEB_ROOT="$1"
VERSION="${2#v}"
OUT="$3"
LINE="${VERSION%.*}"

mkdir -p "$OUT/changelog-media"
cp "$WEB_ROOT/changelog.json" "$OUT/changelog.json"

for dir in "$WEB_ROOT/changelog-media/$LINE".*; do
  if [ -d "$dir" ]; then
    cp -R "$dir" "$OUT/changelog-media/"
  fi
done

echo "Release notes bundled for the $LINE line:"
find "$OUT" -type f | sort
