## Load Balancer
resource "aws_lb" "microservices_alb" {
    name               = "${local.app_name}-${terraform.workspace}-alb"
    internal           = false
    load_balancer_type = "application"
    security_groups    = [aws_security_group.microservices_alb_sg.id]
    subnets            = module.vpc.public_subnets

    tags = {
        Environment = terraform.workspace
    }
}
### Load Balancer Listener (HTTP)
resource "aws_lb_listener" "alb_http" {
    load_balancer_arn = aws_lb.microservices_alb.arn
    port              = "80"
    protocol          = "HTTP"
    
    default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
## Load Balancer Listener (HTTPS)
resource "aws_lb_listener" "alb_https" {
    load_balancer_arn = aws_lb.microservices_alb.arn
    port              = "443"
    protocol          = "HTTPS"
    certificate_arn   = var.certificate_arn

    default_action {
      type = "forward"
      target_group_arn = aws_lb_target_group.backend.arn
    }
}