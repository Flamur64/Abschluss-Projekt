provider "aws" {
  region = "eu-central-1"
}

resource "aws_default_vpc" "vpc" {}

resource "aws_default_subnet" "subnet" {
  availability_zone = "eu-central-1a"
}

resource "aws_security_group" "ports" {
  name        = "allow-ports"
  description = "Security group for allowing ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

    egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "server" {
  ami             = "ami-0faab6bdbac9486fb"
  instance_type   = "t2.micro"
  subnet_id       = aws_default_subnet.subnet.id
  security_groups = [aws_security_group.ports.id]
  key_name        = "key"

  tags = {
    Name = "Ubuntu-Server"
  }

  associate_public_ip_address = true
}

output "public_ip" {
  value = aws_instance.server.public_ip
}

output "public_dns" {
  value = aws_instance.server.public_dns
}