import { NestedStack } from "aws-cdk-lib";
import { Deployment, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { DeployStackProps } from "./interface-props";
import { Stage } from 'aws-cdk-lib/aws-apigateway'
import { NagSuppressions } from 'cdk-nag';

export class ApiDeploymentStageNestedStack extends NestedStack {
    public readonly deploymentStage: Stage;

    constructor(scope: Construct, props: DeployStackProps) {

        super(scope, 'deployStack', props);

        const appApi = RestApi.fromRestApiId(this, 'ProductRestApi', props.restApiId)
        const deployment = new Deployment(this, 'Deployment', { api: appApi });

        if (props.methods) {
            for (const method of props.methods) {
                deployment.node.addDependency(method);
            }
        }

        const [devStage] = ['dev'].map(item =>
            new Stage(this, `${item}`, { deployment, stageName: item }));

        this.deploymentStage = devStage
        appApi.deploymentStage = this.deploymentStage

        NagSuppressions.addStackSuppressions(this, [
            {
                id: 'AwsSolutions-APIG2',
                reason: 'The REST API does not have request validation enabled.'
            },
            {
                id: 'AwsSolutions-APIG6',
                reason: 'The REST API Stage does not have CloudWatch logging enabled for all methods.'
            },
            {
                id: 'AwsSolutions-APIG1',
                reason: 'The API does not have access logging enabled.'
            },
        ])
    }
}