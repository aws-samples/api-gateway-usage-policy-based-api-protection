import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { UserPoolClientProps } from 'aws-cdk-lib/aws-cognito';


export class UserPoolClientConstruct extends Construct {
    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(
        scope: Construct,
        id: string,
        props: UserPoolClientProps,
    ) {
        super(scope, id);

        const clientReadAttributes = new cognito.ClientAttributes()
            .withStandardAttributes({
                givenName: true,
                familyName: true,
                email: true,
                emailVerified: true,
                address: true,
                birthdate: true,
                gender: true,
                locale: true,
                middleName: true,
                fullname: true,
                nickname: true,
                phoneNumber: true,
                phoneNumberVerified: true,
                profilePicture: true,
                preferredUsername: true,
                profilePage: true,
                timezone: true,
                lastUpdateTime: true,
                website: true,
            })
            .withCustomAttributes(...['tenant_id', 'isAdmin']);

        const clientWriteAttributes = new cognito.ClientAttributes()
            .withStandardAttributes({
                givenName: true,
                familyName: true,
                email: true,
                emailVerified: false,
                address: true,
                birthdate: true,
                gender: true,
                locale: true,
                middleName: true,
                fullname: true,
                nickname: true,
                phoneNumber: true,
                profilePicture: true,
                preferredUsername: true,
                profilePage: true,
                timezone: true,
                lastUpdateTime: true,
                website: true,
            })
            .withCustomAttributes(...['tenant_id']);

        this.userPoolClient = new cognito.UserPoolClient(this, 'userpool-client', {
            userPool: props.userPool,
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userSrp: true,
            },
            oAuth: {
                callbackUrls: ["https://openidconnect.net/callback"],
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE]
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.COGNITO,
            ],
            preventUserExistenceErrors: true,
            readAttributes: clientReadAttributes,
            writeAttributes: clientWriteAttributes,
        });
    }
}