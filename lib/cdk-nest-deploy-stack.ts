import * as cdk from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkNestDeployStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const apiNestHandlerFunction = new Function(this, "ApiNestHandler", {
      code: Code.fromAsset("api/dist"), // 👈 This is crucial
      runtime: Runtime.NODEJS_18_X,
      handler: "main.handler",
      environment: {
        STAGE: 'prod',
        DB_HOST: '',
        DB_PASSWORD: '',
        DB_USERNAME: '',
        DB_PORT: '',
        DB_DATABASE: '',
        JWT_SECRET: '',
      }, // 👈 You might need env variables
    });
  
    const api = new RestApi(this, "Api", {
      deploy: true,
      defaultMethodOptions: {
        apiKeyRequired: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["http://localhost:3000"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowHeaders: Cors.DEFAULT_HEADERS,
      },
  });
  
  api.root.addProxy({
      defaultIntegration: new LambdaIntegration(apiNestHandlerFunction, { proxy: true }),
  });
  
  const apiKey = api.addApiKey("ApiKey"); // 👈 to ease your testing
  
  const usagePlan = api.addUsagePlan("UsagePlan", {
      name: "UsagePlan",
      apiStages: [
      {
          api,
          stage: api.deploymentStage,
      },
      ],
  });
  
  usagePlan.addApiKey(apiKey);

  }
}
