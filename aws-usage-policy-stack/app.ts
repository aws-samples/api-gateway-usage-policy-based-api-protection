#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiKeySourceType, AuthorizationType } from 'aws-cdk-lib/aws-apigateway'

import { DEPLOY_REGION, STACK_PREFIX } from './cognito_pool/constants';
import { ApigatewayStack } from './api-gateway/rest_api';
import { CognitoStack } from './cognito_pool/cognito_stack';


const app = new cdk.App();

const methodOptions = {
    apiKeyRequired: true,
    authorizationType: AuthorizationType.CUSTOM

}

const cognitoStack = new CognitoStack(app, 'CognitoStack', {
    stackName: `${STACK_PREFIX}`,
    env: { region: DEPLOY_REGION },
    tags: { env: 'dev' }
});

const restApiProps = {
    deploy: false,
    apiKeySourceType: ApiKeySourceType.AUTHORIZER
}

const API_KEY = "customer2" // '<TENANT_ID>-<RANDOM_VALUE>'. total length should be 20 chars

if (!API_KEY.localeCompare("NOT_DEFINED")) {
    throw new Error('Api key not defined in app.ts. Please open app.ts and update API key (<TENANT_ID>-<RANDOM_VALUE>) total length should be 20 chars) which is same as tenant id that you want to use for creating a user in Cognito')
} else {

    const apiKeyprops = {
        apiKeyName: "ProductApiKey",
        enabled: true,
        value: API_KEY
    }

    new ApigatewayStack(app, apiKeyprops, methodOptions, restApiProps, {
        stackName: `${STACK_PREFIX}`,
        env: { region: process.env.CDK_DEFAULT_REGION },
        tags: { env: 'dev' }
    }).addDependency(cognitoStack)
}