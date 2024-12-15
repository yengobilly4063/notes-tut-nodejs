import { default as logger } from 'morgan';
import * as rfs from 'rotating-file-stream';
import dotenv from 'dotenv';
dotenv.config();

const requestLogFormat = process.env.REQUEST_LOG_FORMAT || 'dev';
const requestLogFile = process.env.REQUEST_LOG_FILE || 'log.txt';

function configureLogs(app) {
  if (requestLogFile) {
    app.use(logger(requestLogFormat));
  }
  app.use(
    logger(requestLogFormat, {
      stream: requestLogFile
        ? rfs.createStream(requestLogFile, {
            size: '10M', // rotate every 10 MegaBytes written
            interval: '1d', // rotate daily
            compress: 'gzip', // compress rotated files
          })
        : process.stdout,
    })
  );
}

export default configureLogs;
