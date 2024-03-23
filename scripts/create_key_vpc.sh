#!/bin/bash

aws ec2 create-key-pair --key-name key --query 'KeyMaterial' --output text > key.pem

chmod 400 key.pem

aws ec2 create-default-vpc