data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ec2_role" {
  name               = "${local.name_prefix}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "ec2_s3_policy" {
  statement {
    sid    = "ListBucketPrefix"
    effect = "Allow"

    actions = ["s3:ListBucket"]

    resources = ["arn:aws:s3:::gold-shop-midea"]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"

      values = [
        "products/*",
        "posts/*",
        "deploy/*",
      ]
    }
  }

  statement {
    sid    = "ReadWriteObjects"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]

    resources = [
      "arn:aws:s3:::gold-shop-midea/products/*",
      "arn:aws:s3:::gold-shop-midea/posts/*",
      "arn:aws:s3:::gold-shop-midea/deploy/*",
    ]
  }
}

resource "aws_iam_policy" "ec2_s3_policy" {
  name   = "${local.name_prefix}-ec2-s3"
  policy = data.aws_iam_policy_document.ec2_s3_policy.json
}

resource "aws_iam_role_policy_attachment" "ec2_s3_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_s3_policy.arn
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

