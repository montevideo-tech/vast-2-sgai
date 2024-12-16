data "aws_iam_policy" "AmazonECSTaskExecutionRolePolicy" {
  name = "AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ECSTaskExecutionRole" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
      
    ]
  })
  inline_policy {
    name = "logs"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action   = ["logs:*"]
          Effect   = "Allow"
          Resource = "*"
        }
      ]
    })
  }
  managed_policy_arns = ["${data.aws_iam_policy.AmazonECSTaskExecutionRolePolicy.arn}"]
}

resource "aws_iam_role" "ECSTaskRole" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
  inline_policy {
    name = "logs"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action   = ["logs:*"]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action   = ["s3:*"]
          Effect   = "Allow"
          Resource = "*"
        },
        {
          Action   = ["secretsmanager:ListSecrets"]
          Effect   = "Allow"
          Resource = "*"
        }
      ]
    })
  }
}