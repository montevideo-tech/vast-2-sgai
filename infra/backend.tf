## ECS
### Cluster
resource "aws_ecs_cluster" "microservices" {
  name = "${local.app_name}-${terraform.workspace}"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

locals {
  port = 3000
}

resource "aws_ecr_repository" "backend" {
  name                 = "${local.app_name}-backend-${terraform.workspace}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_lb_target_group" "backend" {
  name        = "${local.app_name}-backend-${terraform.workspace}"
  port        = local.port
  protocol    = "HTTP"
  target_type = "ip"
  deregistration_delay = 60
  health_check {
    path = "/"
  }
  vpc_id      = module.vpc.vpc_id
  depends_on = [
    aws_lb.microservices_alb
  ]
}

resource "aws_cloudwatch_log_group" "backend" {
  name = "${local.app_name}-backend-${terraform.workspace}"
  retention_in_days = 1
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.app_name}-backend-${terraform.workspace}"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.ECSTaskExecutionRole.arn
  task_role_arn            = aws_iam_role.ECSTaskRole.arn
  container_definitions    = <<TASK_DEFINITION
[
  {
    "name": "${local.app_name}-backend-${terraform.workspace}",
    "image": "${aws_ecr_repository.backend.repository_url}",
    "essential": true,
    "environment": [
      {"name": "NODE_ENV", "value": "${terraform.workspace}"}
    ],
    "portMappings": [
      {
        "containerPort": 3000,
        "hostPort"     : 3000
      }
    ],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "${local.app_name}-backend-${terraform.workspace}",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "vast2sgai-backend"
        }
    }
  }
]
TASK_DEFINITION

  lifecycle {
    ignore_changes = [
      container_definitions
    ]
  }
}

resource "aws_ecs_service" "backend" {
  name            = "${local.app_name}-backend-${terraform.workspace}"
  cluster         = aws_ecs_cluster.microservices.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_backend_sg.id]
  }

  lifecycle {
    ignore_changes = [task_definition]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "${local.app_name}-backend-${terraform.workspace}"
    container_port   = local.port
  }
}