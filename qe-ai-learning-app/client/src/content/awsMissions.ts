export type Mission = {
  id: string; service: string; icon: string; title: string; category: string; color: string;
  minutes: number; description: string; goal: string; lesson: string;
  fields: { id: string; label: string; options: string[]; correct: string; hint: string }[];
};

export const missions: Mission[] = [
  {
    id: 'iam', service: 'IAM', icon: '◇', title: 'Secure your first account', category: 'Identity & access', color: 'rose', minutes: 6,
    description: 'Give the right people the right permissions.',
    goal: 'Your team needs to read files in one project bucket. Secure access without sharing root credentials.',
    lesson: 'IAM controls who can access AWS resources. Use temporary credentials through roles or federation, grant only the permissions needed, and protect sign-in with multi-factor authentication (MFA). Keep the root user for tasks that require it.',
    fields: [
      { id: 'identity', label: 'Team access method', options: ['Choose access method', 'Share the root password', 'Federated access with a role', 'Share a long-lived access key'], correct: 'Federated access with a role', hint: 'Use federation and roles for temporary credentials instead of sharing the root account.' },
      { id: 'policy', label: 'Permission scope', options: ['Choose permissions', 'AdministratorAccess', 'Read objects in the project bucket', 'Write to all S3 buckets'], correct: 'Read objects in the project bucket', hint: 'Least privilege means access only to the actions and resources the team needs.' },
      { id: 'mfa', label: 'Multi-factor authentication', options: ['Choose sign-in protection', 'Require MFA', 'Password only'], correct: 'Require MFA', hint: 'MFA adds another factor beyond a password.' },
    ],
  },
  {
    id: 'ec2', service: 'EC2', icon: '▣', title: 'Launch a web server', category: 'Compute', color: 'orange', minutes: 8,
    description: 'Configure a virtual machine for a small website.',
    goal: 'Launch a small Linux web server. Allow HTTPS from visitors and SSH only from the administrator’s IP.',
    lesson: 'Amazon EC2 provides virtual machines called instances. An AMI is the operating-system image. An instance type determines compute capacity. Security groups control allowed traffic. A public-facing server needs appropriate networking; never open administrative ports to everyone.',
    fields: [
      { id: 'ami', label: 'Amazon Machine Image (AMI)', options: ['Choose an image', 'Amazon Linux', 'Windows Server'], correct: 'Amazon Linux', hint: 'This mission asks for a Linux server.' },
      { id: 'size', label: 'Instance type', options: ['Choose instance type', 't3.micro · small workload', 'p5.48xlarge · GPU training'], correct: 't3.micro · small workload', hint: 'Choose a small general-purpose instance for this learning workload. This simulation makes no free-tier claim.' },
      { id: 'traffic', label: 'Security group inbound rules', options: ['Choose inbound rules', 'All traffic from everywhere', 'HTTPS from everywhere; SSH from my IP', 'SSH from everywhere'], correct: 'HTTPS from everywhere; SSH from my IP', hint: 'Visitors need HTTPS (443); restrict administrative SSH (22) to your IP.' },
    ],
  },
  {
    id: 's3', service: 'S3', icon: '⬡', title: 'Store it safely', category: 'Storage', color: 'green', minutes: 6,
    description: 'Build a private home for your application files.',
    goal: 'Configure a private bucket for team documents and recover from accidental object overwrites.',
    lesson: 'Amazon S3 stores objects in buckets, rather than a traditional disk filesystem. Block Public Access helps prevent public exposure. Versioning keeps multiple object versions. S3 encrypts new uploads by default; SSE-S3 uses S3-managed encryption keys.',
    fields: [
      { id: 'public', label: 'Block Public Access', options: ['Choose public access setting', 'Block all public access', 'Allow public access'], correct: 'Block all public access', hint: 'Team documents should not be public.' },
      { id: 'version', label: 'Bucket versioning', options: ['Choose versioning', 'Enable versioning', 'Disable versioning'], correct: 'Enable versioning', hint: 'Versioning helps recover earlier versions after overwrites.' },
      { id: 'encryption', label: 'Default encryption', options: ['Choose encryption', 'SSE-S3 · S3-managed keys', 'Upload unencrypted objects'], correct: 'SSE-S3 · S3-managed keys', hint: 'SSE-S3 encrypts objects at rest with S3-managed keys.' },
    ],
  },
  {
    id: 'vpc', service: 'VPC', icon: '⌘', title: 'Connect the cloud', category: 'Networking', color: 'purple', minutes: 8,
    description: 'Give each workload its own place in the network.',
    goal: 'Design a two-tier network: a public web tier and a database that is not directly reachable from the internet.',
    lesson: 'A VPC is a logically isolated network. Subnets divide it into address ranges within Availability Zones. A public subnet routes to an internet gateway; a private subnet does not have a direct internet-gateway route. Security groups still determine which traffic is allowed.',
    fields: [
      { id: 'web', label: 'Web-tier subnet', options: ['Choose subnet', 'Public subnet with internet gateway route', 'Isolated subnet without internet access'], correct: 'Public subnet with internet gateway route', hint: 'The public web tier needs an internet-facing route and suitable addressing.' },
      { id: 'db', label: 'Database placement', options: ['Choose placement', 'Private subnets', 'Public subnet with public IP'], correct: 'Private subnets', hint: 'Keep the database away from direct internet access.' },
      { id: 'db-rule', label: 'Database security group source', options: ['Choose allowed source', 'Web-tier security group', '0.0.0.0/0 · everyone'], correct: 'Web-tier security group', hint: 'Allow database traffic from the application tier rather than the entire internet.' },
    ],
  },
  {
    id: 'rds', service: 'RDS', icon: '▤', title: 'Make data resilient', category: 'Databases', color: 'blue', minutes: 7,
    description: 'Choose managed relational storage and recovery.',
    goal: 'Configure a production relational database with standby availability and a recovery window.',
    lesson: 'Amazon RDS manages common database operations for relational engines. A Multi-AZ DB instance deployment provides a standby in another Availability Zone for failover; that standby is not a read replica for scaling reads. Automated backups support point-in-time recovery within the retention period.',
    fields: [
      { id: 'engine', label: 'Database engine', options: ['Choose engine', 'PostgreSQL', 'S3 object storage'], correct: 'PostgreSQL', hint: 'PostgreSQL is a relational database engine supported by RDS.' },
      { id: 'availability', label: 'Availability configuration', options: ['Choose deployment', 'Multi-AZ DB instance deployment', 'Single-AZ only'], correct: 'Multi-AZ DB instance deployment', hint: 'Multi-AZ provides a standby for failover across Availability Zones.' },
      { id: 'backup', label: 'Automated backup retention', options: ['Choose retention', '7 days', '0 days · disabled'], correct: '7 days', hint: 'Keep automated backups enabled for a recovery window.' },
    ],
  },
  {
    id: 'cloudwatch', service: 'CloudWatch', icon: '◴', title: 'Spot the signal', category: 'Observability', color: 'pink', minutes: 5,
    description: 'Turn performance metrics into useful alerts.',
    goal: 'Notify the operations team when an EC2 instance stays above 80% CPU for five minutes.',
    lesson: 'Amazon CloudWatch collects metrics and logs. Alarms evaluate metrics against thresholds over time. Amazon SNS can deliver alarm notifications. An alarm only triggers the configured action; a notification alone does not scale or repair a workload.',
    fields: [
      { id: 'metric', label: 'Metric', options: ['Choose a metric', 'EC2 · CPUUtilization', 'S3 · BucketSizeBytes'], correct: 'EC2 · CPUUtilization', hint: 'CPUUtilization measures instance CPU usage.' },
      { id: 'threshold', label: 'Alarm condition', options: ['Choose a condition', 'CPU > 80% for 5 minutes', 'CPU < 5% for 1 minute'], correct: 'CPU > 80% for 5 minutes', hint: 'Match both the threshold and the duration in the mission.' },
      { id: 'action', label: 'Notification action', options: ['Choose an action', 'Send to an SNS topic with a confirmed subscription', 'Delete the instance'], correct: 'Send to an SNS topic with a confirmed subscription', hint: 'SNS delivers notifications to subscribers; confirm the subscription to receive them.' },
    ],
  },
  {
    id: 'budgets', service: 'Budgets', icon: '◎', title: 'Keep costs in check', category: 'Cloud economics', color: 'teal', minutes: 5,
    description: 'Set a spending guardrail before you explore.',
    goal: 'Set a monthly $10 learning budget with an alert at 80% of actual spend.',
    lesson: 'AWS Budgets tracks spending against a target and sends configured alerts. Cost information and notifications can be delayed. A budget alert does not automatically cap spending or stop resources. Delete unneeded resources and review ongoing costs.',
    fields: [
      { id: 'period', label: 'Budget period', options: ['Choose a period', 'Monthly', 'Annually'], correct: 'Monthly', hint: 'Use the monthly period requested by the mission.' },
      { id: 'amount', label: 'Budget amount', options: ['Choose an amount', '$10', '$1,000'], correct: '$10', hint: 'The learning budget target is $10; no real budget or charge is created here.' },
      { id: 'alert', label: 'Alert threshold', options: ['Choose a threshold', '80% of actual spend', 'Disable notifications'], correct: '80% of actual spend', hint: 'An 80% alert provides a warning before the target. It is not a spending cap.' },
    ],
  },
];
