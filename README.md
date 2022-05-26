<h1 align="center">
Amazon Api Gateway usage policy based api protection
<br>
   <a href="https://github.com/aws-samples/api-gateway-usage-policy-based-api-protection/releases"><img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/aws-samples/api-gateway-usage-policy-based-api-protection?display_name=tag"></a>
   <a href="https://github.com/aws-samples/api-gateway-usage-policy-based-api-protection/actions"><img alt="GitHub Workflow Status" src="https://github.com/aws-samples/api-gateway-usage-policy-based-api-protection/workflows/Unit%20Tests/badge.svg"></a>
</h1>

In this blog post, we look at how to protect and monetize multi-tenant APIs using Amazon API Gateway. I describe a multi-tenant architecture design pattern based on custom tenant ID to onboard customers. A tenant in a multi-tenant platform represents the customer having a group of users with common access, but individuals having specific privileges to the platform

The solution to protect multi-tenant platform REST APIs uses Amazon Cognito, Amazon API Gateway and AWS Lambda, as shown in the architecture diagram below.

### Architecture

Target architecture:

<p align="center">
  <img src="docs/APIGateway-UsagePlans.png" alt="AWS Architecture Diagram" />
</p>

### Usage

#### Prerequisites
To deploy the solution,

1. [An AWS Account](https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fportal.aws.amazon.com%2Fbilling%2Fsignup%2Fresume&client_id=signup)
2. [An AWS Identity and Access Management (IAM) administrator access](http://aws.amazon.com/iam)
3. [The AWS Command Line Interface (AWS CLI)](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
4. [Install AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)


#### Deploy cloud solution

> **Note**
You are responsible for the cost of the AWS services used while running this sample deployment. There is no additional
cost for using this sample. For full details, see the pricing pages for each AWS service that you use in this sample. Prices are subject to change.

1. Local Setup:

    1. Clone repository to your local.
        * `git clone https://github.com/aws-samples/api-gateway-usage-policy-based-api-protection`

    2. Prepare package - The `cdk.json` file tells the CDK Toolkit how to execute your app.
        * `cdk synth`                                               emits the synthesized CloudFormation template
        * `npm run build`                                           compile typescript to js
        * `npm install --prefix aws-usage-policy-stack/lambda/src`  install npm packages

2. Deploy Amazon Cognito Resources

    1.	Configure user pool in Amazon Cognito
        * `npx cdk deploy CognitoStack`     deploy Cognito stack
    2.	Once successfully deployed, open AWS Console and select Amazon Cognito service. choose manage user pool and select your user pool. Note down pool id under general settings.

    <p align="center">
    <img src="docs/user-pool-id.png" alt="Cognito User Pool" />
    </p>

    3.	Create a user with tenant id.

        * `aws cognito-idp admin-create-user --user-pool-id <REPLACE WITH COGNITO POOL ID> --username <REPLACE WITH USERNAME> \
        --user-attributes Name="given_name",Value="<REPLACE WITH FIRST NAME>" Name="family_name",Value="<REPLACE WITH LAST NAME>" " Name="custom:tenant_id",Value="<REPLACE WITH CUSTOMER ID>" \
        --temporary-password change1t`

        e.g.
        * `aws cognito-idp admin-create-user --user-pool-id eu-west-1_ABCBCBCB --username abc@xyz.com \
        --user-attributes Name="given_name",Value="John" Name="family_name",Value="Smith" Name="custom:tenant_id",Value="customer1" \
        --temporary-password change1t`

    4.	Testing oauth flow via browser can be cumbersome. So you can use [openidconnect](https://openidconnect.net/) to test auth flow. In the configuration of openidconnect.net, configure JWKS well know URI 
    e.g. 
        * `https://cognito-idp.<REPLACE WITH AWS REGION>.amazonaws.com/<REPLACE WITH COGNITO POOL ID>/.well-known/openid-configuration`
    e.g. 
    https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_ABdffdfdf/.well-known/openid-configuration

    5.	Test Oauth flow [open id connect](https://openidconnect.net/) using to get the JWT ID Token. Save the token in nodepad.


3. Deploy Amazon API Gateway resources

    1.	Open aws-usage-policy-stack/app.ts in an IDE and replace “NOT_DEFINED” with 20 chars long tenant id from step 3 in Deploy Amazon Cognito Resources. 
    2.	Configure user pool in Amazon API Gateway and upload Lambda
        * `npx cdk deploy ApigatewayStack`  deploy Api Gateway stack

    3.	After successful deployment of API Gateway stack, open AWS console and select Amazon API Gateway. Locate ProductRestApi in name column and note down its id from id column as highlighted in below screen.

    <p align="center">
    <img src="docs/Api-gateway-api-id.png" alt="API Gateway Deployed API id" />
    </p>


## Test the solution

I configured the entire solution in the AWS cloud so far for a tenant in the above section Deploy cloud solution. Now let us test Amazon API Gateway Usage plan to verify it protects API based on throttle limits per second and quota limit per Day. You can configure quota limits per Day, Week and Month. 

We configured the “/products” API Quota limit to 5 per Day and throttle limit as 10/sec rate limit and 2/sec burst limit

Execute the following command 5 times after replacing placeholders with the correct values. You should receive the message {"message": "Limit Exceeded"} after you execute below command for the sixth time. You can manually change the quota limits in usage plan in AWS Console and repeat the tests.

`curl -H "Authorization: Bearer <REPLACE WITH ID_TOKEN received in step 5 of Deploy Amazon Cognito Resources>" -X GET https://<REPLACE WITH REST API ID noted in step 3 of Deploy Amazon API Gateway resources>.execute-api.eu-west-1.amazonaws.com/dev/products.`

You can monitor HTTP/2 429 exceptions (Limit Exceeded) in Amazon API Gateway dashboard when API Gateway throttles the requests.

<p align="center">
<img src="docs/api-gateway-dashboard.png" alt="API Gateway metrics dashboard" />
</p>

Any changes to usage plan limits do not need redeployment of API in Amazon API Gateway. You can change limits dynamically. However, please note that it may take 5-10 sec to come limits into effect.

### Clean up

To avoid incurring future charges, please clean up the resources created.

To remove the stack:

1. run below cdk command
    * `cdk destroy *`   deletes all the AWS cloud resources deployed


## Security
See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License
This library is licensed under the MIT-0 License. See the LICENSE file.
