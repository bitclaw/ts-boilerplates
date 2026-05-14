import { app } from './app.ts';
import { logger } from './lib/logger.ts';

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
