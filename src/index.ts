import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;
console.log(process.env.NODE_ENV)

const server = app.listen(PORT, onListening);
server.on("error", onError);

function onError(error: NodeJS.ErrnoException) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            logger.error('Unexpected error while starting the server', { payload: error })
            throw error;
    }
}

function onListening() {
    console.log(`Listening on ${PORT}`);
}
