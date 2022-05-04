const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const util = require('util');


interface PolicyStatementType {
    Action: string;
    Effect: string;
    Resource: string;
}


interface PolicyDocumentType {
    Version: string;
    Statement: PolicyStatementType;
}

interface IAMPolicy {
    principalId: string;
    policyDocument: PolicyDocumentType;
    usageIdentifierKey: string
}

const apiPermissions = [
    {
        "arn": `arn:aws:execute-api:${process.env.AWS_REGION}:${process.env.ACCOUNT_ID}:${process.env.API_ID}`, // NOTE: Replace with your API Gateway API ARN
        "resource": "*", // NOTE: Replace with your API Gateway Resource
        "stage": "dev", // NOTE: Replace with your API Gateway Stage
        "httpVerb": "GET", // NOTE: Replcae with the HTTP Verbs you want to allow access your REST Resource
        "scope": "email" // NOTE: Replace with the proper OAuth scopes that can access your REST Resource
    }
];

const defaultDenyAllPolicy = {
    "principalId": "user",
    "policyDocument": {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Action": "execute-api:Invoke",
                "Effect": "Deny",
                "Resource": "*"
            }
        ]
    }
};

const generatePolicyStatement = (apiName, apiStage, apiVerb, apiResource, action) => {

    const methodArn = apiName + "/" + apiStage + "/" + apiVerb + "/" + apiResource;
    const statement: PolicyStatementType = {
        Action: 'execute-api:Invoke',
        Effect: action,
        Resource: methodArn
    }

    return statement;
};

const generatePolicy = (principalId, policyStatements, tenant_id) => {

    const authResponse: IAMPolicy = {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: policyStatements
        },
        usageIdentifierKey: tenant_id + '-abcbabcbabbcbcbcbcbcbcbcbccbcbcbcbcbcb'
    };
    return authResponse;
};


function generateIAMPolicy(scopeClaims, principalId, tenant_id) {
    // Declare empty policy statements array
    let policyStatements: PolicyStatementType[] = [];
    // Iterate over API Permissions
    for (let i = 0; i < apiPermissions.length; i++) {
        // Check if token scopes exist in API Permission
        if (scopeClaims.indexOf(apiPermissions[i].scope) > -1) {
            // User token has appropriate scope, add API permission to policy statements

            const ps = generatePolicyStatement(apiPermissions[i].arn, apiPermissions[i].stage,
                apiPermissions[i].httpVerb, apiPermissions[i].resource, "Allow")

            policyStatements.push(ps);
        }
    }
    // Check if no policy statements are generated, if so, create default deny all policy statement
    if (policyStatements.length === 0) {
        return defaultDenyAllPolicy;
    } else {
        return generatePolicy(principalId, policyStatements, tenant_id);
    }
}

exports.handler = async (event, context) => {
    // Declare Policy
    let iamPolicy = null;
    // Capture raw token and trim 'Bearer ' string, if present
    const token = event.authorizationToken.replace("Bearer ", "");

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new Error('invalid token');
    }

    const getSigningKey = util.promisify(client.getSigningKey);
    return getSigningKey(decoded.header.kid)
        .then((key) => {
            const signingKey = key.publicKey || key.rsaPublicKey;
            return jwt.verify(token, signingKey);
        })
        .then((decoded_token) => {

            const scopeClaims = ['email']
            const tenant = decoded_token['custom:tenant_id']
            return generateIAMPolicy(scopeClaims, decoded_token.sub, tenant);
        });

};


const client = jwksClient({
    jwksUri: process.env.JWKS_ENDPOINT
});