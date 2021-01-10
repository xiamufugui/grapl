#!/usr/bin/env bash

yarn run build &&
cdk destroy -f --require-approval=never "*"

date
