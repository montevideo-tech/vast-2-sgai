##
## PIPELINE USER
##
resource "aws_iam_user" "svc_pipeline" {
    name    = "svc_pipeline-${terraform.workspace}"
}
resource "aws_iam_user_policy" "svc_pipeline_policy" {
  name    = "VAST2SGEI_pipeline_policy-${terraform.workspace}"
  user    = aws_iam_user.svc_pipeline.name
  policy  =  <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecs:*",
        "ecr:*",
        "iam:PassRole"
      ],
      "Effect": "Allow",
      "Resource": [
          "*"
      ]
    },
    {
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Effect": "Allow",
      "Resource": [
          "*"
      ]
    }
  ]
}
EOF
}
resource "aws_iam_access_key" "svc_pipeline_key" {
  user = aws_iam_user.svc_pipeline.name
}
output "pipeline_user_keys" {
  value = aws_iam_access_key.svc_pipeline_key.id
  description = "Pipeline user key"
  sensitive = true
}
output "pipeline_user_secret_keys" {
  value = aws_iam_access_key.svc_pipeline_key.secret
  description = "Pipeline user secret key"
  sensitive = true
}

