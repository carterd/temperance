import * as winston from 'winston';

export default class TestConfig
{
    public static logger: any = new winston.Logger({
        transports: [ new winston.transports.Console(
            {
                level: 'debug',
                handleExceptions: true,
                json: false,
                colorize: true
            }
        )],
        exitOnError: false,
    });    
}
