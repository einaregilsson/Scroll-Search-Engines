#!/bin/bash
#
# Linux shell build script for extension
#
# Assumes to be in the right directory

EXT=ScrollSearchEngines.xpi
BUILD="build"
TARGET="$BUILD/$EXT"


if [ ! -d $BUILD ]; then
  mkdir $BUILD
fi
if [ -d $TARGET ]; then
  rm -vf $TARGET
fi
zip -r $TARGET * -x build* *.py *.bat *.sh
