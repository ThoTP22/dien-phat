variable "aws_region" {
  description = "AWS region để deploy hạ tầng"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Tên dự án để đặt prefix resource"
  type        = string
  default     = "gold-shop-midea"
}

variable "environment" {
  description = "Môi trường (dev/stage/prod)"
  type        = string
  default     = "dev"
}

variable "ssh_allowed_cidr" {
  description = "CIDR cho phép SSH vào EC2 (ví dụ 1.2.3.4/32). Để trống nếu chỉ dùng SSM."
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "Loại EC2 instance cho web server"
  type        = string
  default     = "t3.small"
}

