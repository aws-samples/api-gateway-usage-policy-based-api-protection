
import {
    RestApi,
    RestApiProps, MethodOptions, TokenAuthorizer, IdentitySource, Period, ApiKey, ApiKeyProps
}
    from 'aws-cdk-lib/aws-apigateway';

import { App, CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { MultiTenantProductApiStack } from './multi-tenant-product-api'
import { ApiDeploymentStageNestedStack } from './api-stage';
import { LambdaCustomAuthorizer } from '../lambda/lambda_stack';
import { AssetCode, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LegendPosition } from 'aws-cdk-lib/aws-cloudwatch';

export class ApigatewayStack extends Stack {


    constructor(scope: App, apiKeyprops: ApiKeyProps, methodOptions: MethodOptions = { apiKeyRequired: false },
        props?: RestApiProps, stackProps?: StackProps) {

        super(scope, "ApigatewayStack")

        const restApi = new RestApi(this, "ProductRestApi", props)
        restApi.root.addMethod('ANY')

        const { lambdaAuthorizerFn } = new LambdaCustomAuthorizer(this, 'lambdaAuthorizer', restApi.restApiId);

        const authorizer = new TokenAuthorizer(this, 'tokenAuthorizer', {
            authorizerName: 'lambdaAuthorizer',
            identitySource: IdentitySource.header('Authorization'),
            handler: lambdaAuthorizerFn,
            validationRegex: "^(Bearer )[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)$"
        });


        methodOptions = { ...methodOptions, authorizer }

        const multiTenantApiStack = new MultiTenantProductApiStack(this, {
            restApiId: restApi.restApiId,
            rootResourceId: restApi.restApiRootResourceId,
            methodOptions: methodOptions
        })

        const { deploymentStage } = new ApiDeploymentStageNestedStack(this, {
            restApiId: restApi.restApiId,
            methods: multiTenantApiStack.methods,
            api: restApi
        });


        // const productApiKey = new ApiKey(this, "ProductApiKey", {
        //     apiKeyName: 'ProductApiKey',
        //     value: 'customer2-abcbabcbabbcbcbcbcbcbcbcbccbcbcbcbcbcb',
        //     enabled: true
        // })
        const productApiKey = new ApiKey(this, "ProductApiKey", apiKeyprops)

        const usagePlan = restApi.addUsagePlan('BasicUsagePlan', {
            name: "BasicUsagePlan",
            throttle: {
                rateLimit: 10,
                burstLimit: 2
            },
            quota: {
                limit: 5,
                period: Period.DAY
            }
        })

        usagePlan.addApiKey(productApiKey)

        usagePlan.addApiStage({ stage: deploymentStage })
        new CfnOutput(this, 'region', { value: Stack.of(this).region });
        new CfnOutput(this, 'apigateway', { value: restApi.restApiId });
        new CfnOutput(this, 'lambda', { value: lambdaAuthorizerFn.functionName });


    }
}
