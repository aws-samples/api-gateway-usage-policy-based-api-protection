import { NestedStack } from "aws-cdk-lib";
import { Deployment, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { DeployStackProps } from "./interface-props";
import { Stage } from 'aws-cdk-lib/aws-apigateway'

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
    }
}