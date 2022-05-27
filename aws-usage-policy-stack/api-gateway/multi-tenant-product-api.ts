import { NestedStack } from "aws-cdk-lib";
import { Method, MockIntegration, PassthroughBehavior, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { ResourceNestedStackProps } from "./interface-props";

import { NagSuppressions } from 'cdk-nag';

export class MultiTenantProductApiStack extends NestedStack {
    public readonly methods: Method[] = [];
    constructor(scope: Construct, props: ResourceNestedStackProps) {
        super(scope, 'multiTenantApiStack', props);

        const api = RestApi.fromRestApiAttributes(this, 'ProductRestApi', {
            restApiId: props.restApiId,
            rootResourceId: props.rootResourceId,
        });

        const method = api.root.addResource('products').addMethod('GET', new MockIntegration({
            integrationResponses: [{
                statusCode: '200',
                responseTemplates: { 'application/json': "{statusCode : 200, Message: Api access successful}}" }
            }],
            passthroughBehavior: PassthroughBehavior.NEVER,
            requestTemplates: {
                'application/json': '{ "statusCode": 200 }',
            },
        }), {
            methodResponses: [{ statusCode: '200' }],
            apiKeyRequired: props.methodOptions.apiKeyRequired,
            authorizationType: props.methodOptions.authorizationType,
            authorizer: props.methodOptions.authorizer
        });

        this.methods.push(method);

        NagSuppressions.addStackSuppressions(this, [
            {
                id: 'AwsSolutions-COG4',
                reason: 'The API GW method does not use a Cognito user pool authorizer.'
            }
        ])
    }
}