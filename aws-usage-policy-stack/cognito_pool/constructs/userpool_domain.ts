import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { UserPoolDomainProps } from 'aws-cdk-lib/aws-cognito';


export class UserPoolDomainConstruct extends Construct {
    public readonly userPoolDomain: cognito.UserPoolDomain;

    constructor(
        scope: Construct,
        id: string,
        props: UserPoolDomainProps,
    ) {
        super(scope, id);

        this.userPoolDomain = new cognito.UserPoolDomain(this, 'userpool-domain', props);
    }
}