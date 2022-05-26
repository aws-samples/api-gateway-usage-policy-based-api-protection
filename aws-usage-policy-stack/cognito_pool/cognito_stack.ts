
import { Stack, App, StackProps, CfnOutput } from 'aws-cdk-lib';
import { UserPoolDomainConstruct } from './constructs/userpool_domain';
import { UserPoolConstruct } from './constructs/user_pool';
import { UserPoolClientConstruct } from './constructs/user_pool_client';

import { UserPoolUserConstruct } from './constructs/user_pool_user';

export class CognitoStack extends Stack {
    public readonly cognito_pool_id: string;
    constructor(scope: App, id: string, props?: StackProps) {
        {
            super(scope, id, props);

            const { userPool } = new UserPoolConstruct(this, 'userpool');

            const { userPoolClient } = new UserPoolClientConstruct(
                this,
                'userpoolclient',
                { userPool },
            );



            const { userPoolDomain } = new UserPoolDomainConstruct(
                this,
                'userpooldomain',
                {
                    userPool,
                    cognitoDomain: { domainPrefix: 'multi-tenant-app' }
                }
            );


            new CfnOutput(this, 'region', { value: Stack.of(this).region });

            new CfnOutput(this, 'userPoolId', { value: userPool.userPoolId });

            new CfnOutput(this, 'userPoolClientId', {
                value: userPoolClient.userPoolClientId,
            });

            new CfnOutput(this, 'userpoolDomain', {
                value: userPoolDomain.domainName,
            });


            new CfnOutput(this, 'CognitoUserPoolId', {
                value: userPool.userPoolId,
                description: 'name of cognito pool idt',
                exportName: 'CognitoUserPoolId',
            });
        }
    }
}
