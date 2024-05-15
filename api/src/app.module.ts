import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
    imports: [
        AuthModule,
        TasksModule,
        ConfigModule.forRoot({
            envFilePath: [`.env.stage.${process.env.STAGE}`],
            validationSchema: configValidationSchema,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                console.log('config', configService.get('DB_USERNAME'))
                return {
                    password: configService.get('DB_PASSWORD'),
                    username: configService.get('DB_USERNAME'),
                    database: configService.get('DB_DATABASE'),
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    type: 'postgres',
                    autoLoadEntities: true,
                    // synchronize: true,
                    ssl: true,
                };
            },
        }),
        //   TypeOrmModule.forRoot({
        //     type: 'postgres',
        //     host: 'ep-shrill-frog-a2p4fr1k.eu-central-1.aws.neon.tech',
        //     port: 5432,
        //     username: 'neondb_owner',
        //     password: 'V9vzpgu3jAor',
        //     database: 'postgres_db',
        //     autoLoadEntities: true,
        //     synchronize: true,
        //     ssl: true,
        // }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
