import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeScheduler } from './lib/scheduler';
import { initializeDatabase } from '../scripts/init-rbac-db';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // 初始化数据库和定时任务
  try {
    console.log('初始化RBAC数据库...');
    await initializeDatabase();

    console.log('启动定时任务调度器...');
    initializeScheduler();
  } catch (error) {
    console.error('初始化失败:', error);
  }

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', err => {
    console.error(err);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});
