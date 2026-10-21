import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.API_PORT || 3001);

try {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL chưa được cấu hình; đăng nhập chưa khả dụng. Smart Menu vẫn hoạt động độc lập.');
  }
  app.listen(port, '0.0.0.0', () => {
    console.log(`HomeMeal API listening on http://localhost:${port}`);
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
