#!/bin/bash

read -p "IP-Adresse für die SSH-Verbindung: " ip_address

ssh -i "key.pem" ubuntu@"$ip_address"
