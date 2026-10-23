resource "aws_ecs_cluster" "main" {
  name = var.name
}

resource "aws_security_group" "tasks" {
  name        = "${var.name}-tasks"
  description = "App containers: in from the load balancer, out to AWS APIs over HTTPS"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "tasks_from_alb" {
  security_group_id            = aws_security_group.tasks.id
  description                  = "From the load balancer"
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = 8080
  to_port                      = 8080
}

# There's no NAT gateway or VPC endpoint, so ECR, DynamoDB, SNS, SSM, X-Ray and
# CloudWatch are reached over their public HTTPS endpoints.
resource "aws_vpc_security_group_egress_rule" "tasks_https" {
  security_group_id = aws_security_group.tasks.id
  description       = "HTTPS to AWS APIs"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${var.name}/web"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "adot" {
  name              = "/ecs/${var.name}/adot"
  retention_in_days = 7
}

data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Used by ECS itself: pull the image, write logs, read the session secret.
resource "aws_iam_role" "task_execution" {
  name               = "${var.name}-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "task_execution_secret" {
  statement {
    actions   = ["ssm:GetParameters"]
    resources = [aws_ssm_parameter.session_secret.arn]
  }
}

resource "aws_iam_role_policy" "task_execution_secret" {
  name   = "read-session-secret"
  role   = aws_iam_role.task_execution.id
  policy = data.aws_iam_policy_document.task_execution_secret.json
}

# Used by the app and the ADOT sidecar: the table, the topic and X-Ray, nothing else.
resource "aws_iam_role" "task" {
  name               = "${var.name}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

data "aws_iam_policy_document" "task" {
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query"]
    resources = [aws_dynamodb_table.main.arn]
  }

  statement {
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.application_submitted.arn]
  }
}

resource "aws_iam_role_policy" "task" {
  name   = "web"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task.json
}

resource "aws_iam_role_policy_attachment" "task_xray" {
  role       = aws_iam_role.task.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

locals {
  web_environment = {
    APP_ORIGIN                  = "https://${var.domain_name}"
    AWS_REGION                  = var.region
    DYNAMODB_TABLE              = aws_dynamodb_table.main.name
    EVENTS_MODE                 = "sns"
    SNS_TOPIC_ARN               = aws_sns_topic.application_submitted.arn
    MULESOFT_BASE_URL           = "http://localhost:8080/api/mock-mulesoft"
    MOCK_MULESOFT_LATENCY_MS    = "300"
    MOCK_MULESOFT_FAIL_RATE     = "0"
    COOKIE_SECURE               = "true"
    LOG_LEVEL                   = "info"
    OTEL_SERVICE_NAME           = "zurich-life-direct-web"
    OTEL_EXPORTER_OTLP_ENDPOINT = "http://localhost:4318"
  }
}

resource "aws_ecs_task_definition" "web" {
  family                   = "${var.name}-web"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name                   = "web"
      image                  = "${aws_ecr_repository.web.repository_url}:${var.image_tag}"
      essential              = true
      readonlyRootFilesystem = true
      linuxParameters = {
        initProcessEnabled = true
        capabilities       = { drop = ["ALL"] }
      }
      portMappings = [{ containerPort = 8080, protocol = "tcp" }]
      environment  = [for key, value in local.web_environment : { name = key, value = value }]
      secrets      = [{ name = "SESSION_SECRET", valueFrom = aws_ssm_parameter.session_secret.arn }]
      dependsOn    = [{ containerName = "adot", condition = "START" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.web.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "web"
        }
      }
    },
    {
      # Receives OTLP from the app on localhost:4318 and sends traces to X-Ray.
      name      = "adot"
      image     = "public.ecr.aws/aws-observability/aws-otel-collector:v0.50.0"
      essential = false
      command   = ["--config=/etc/ecs/ecs-xray.yaml"]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.adot.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "adot"
        }
      }
    },
  ])
}

resource "aws_ecs_service" "web" {
  name                              = "web"
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.web.arn
  desired_count                     = 1
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 30

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 8080
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [aws_lb_listener.https]
}
