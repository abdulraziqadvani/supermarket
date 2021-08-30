#!/bin/bash

dockerize -wait tcp://postgres:5432 -timeout 20s

echo "Start Wait Postgres"
