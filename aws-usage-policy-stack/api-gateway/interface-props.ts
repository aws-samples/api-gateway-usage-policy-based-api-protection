import { NestedStackProps } from "aws-cdk-lib";
import { Method, MethodOptions, RestApi } from "aws-cdk-lib/aws-apigateway";

export interface DeployStackProps extends NestedStackProps {
    readonly restApiId: string;
    readonly methods?: Method[];
    readonly api: RestApi
}

export interface ResourceNestedStackProps extends NestedStackProps {
    readonly restApiId: string;
    readonly rootResourceId: string;
    readonly methodOptions: MethodOptions;
}