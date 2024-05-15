import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
const serverlessExpress = require('@codegenie/serverless-express');
import { Context, Handler } from 'aws-lambda';
import * as express from 'express';

import { AppModule } from './app.module';
// import { Logger } from '@nestjs/common';

let cachedServer;
// const logger = new Logger('bootstrap');

async function bootstrap() {
    // logger.verbose('Start bootstrap');
    if (!cachedServer) {
        const expressApp = express();
        const nestApp = await NestFactory.create(
            AppModule,
            new ExpressAdapter(expressApp),
        );

        nestApp.enableCors();

        await nestApp.init();

        cachedServer = serverlessExpress({ app: expressApp });
    }

    return cachedServer;
}

const handler = async (event: any, context: Context, callback: any) => {
    const server = await bootstrap();
    // logger.verbose('Finished bootstrap');
    return server(event, context, callback);
};

module.exports.handler = handler;
