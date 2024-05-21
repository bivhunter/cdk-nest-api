const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    // '@nestjs/platform-express',
    // 'express',
    // 'class-transformer/storage' // https://github.com/nestjs/mapped-types/issues/486#issuecomment-932715880
];

module.exports = function (options, webpack) {
    return {
        ...options,
        entry: ['./src/lambda.ts'],
        externals: [],
        output: {
            ...options.output,
            libraryTarget: 'commonjs2',
        },
        plugins: [
            ...options.plugins,
            new webpack.IgnorePlugin({
                checkResource(resource) {
                    // Ignoring non-essential modules for Lambda deployment
                    return lazyImports.includes(resource);
                },
            }),
        ],
    };
};
