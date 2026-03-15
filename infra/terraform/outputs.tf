output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

output "ecr_frontend_url" {
  description = "ECR URL cho frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_url" {
  description = "ECR URL cho backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "web_instance_id" {
  description = "Instance ID của EC2 (dùng cho SSM)"
  value       = aws_instance.web.id
}

output "web_instance_public_ip" {
  description = "Public IP của EC2 web"
  value       = aws_instance.web.public_ip
}

output "web_instance_elastic_ip" {
  description = "Elastic IP cố định - dùng IP này để trỏ tên miền (A record) tại Hostinger"
  value       = aws_eip.web.public_ip
}

output "web_instance_public_dns" {
  description = "Public DNS của EC2 web"
  value       = aws_instance.web.public_dns
}

output "dns_instructions" {
  description = "Hướng dẫn cấu hình DNS tại Hostinger"
  value       = <<-EOT

    ===== CẤU HÌNH DNS TẠI HOSTINGER =====
    1. Đăng nhập Hostinger > Domains > chọn tên miền > DNS
    2. Thêm bản ghi A:
       - Name: @    -> Value: ${aws_eip.web.public_ip}
       - Name: www  -> Value: ${aws_eip.web.public_ip}
    3. Đợi 5-30 phút để DNS propagate

  EOT
}

