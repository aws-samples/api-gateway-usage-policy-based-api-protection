import { Stack, App, Duration, Fn } from 'aws-cdk-lib';
import { AssetCode, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs';
const path = require("path");

export class LambdaCustomAuthorizer extends Construct {

    public readonly lambdaAuthorizerFn: Function

    constructor(scope: Construct, id: string, apiId: string) {
        super(scope, id)

        const cognitoUserPoolId = Fn.importValue('CognitoUserPoolId');

        process.env.JWKS_URI = `https://cognito-idp.${process.env.CDK_DEFAULT_REGION}.amazonaws.com/${cognitoUserPoolId}/.well-known/jwks.json`
        this.lambdaAuthorizerFn = new Function(this, 'lambdaFunction', {
            code: AssetCode.fromAsset(path.join(__dirname, 'src'), { exclude: ['*.ts'] }),
            handler: 'index.handler',
            runtime: Runtime.NODEJS_14_X,
            memorySize: 1024,
            timeout: Duration.seconds(5),
            environment: {
                JWKS_ENDPOINT: process.env.JWKS_URI,
                API_ID: apiId,
                ACCOUNT_ID: <string>process.env.CDK_DEFAULT_ACCOUNT
            }
        })

    }
}


