import app from './app.js';
import { config } from './config/index.js';
import { nutritionQueue } from './services/nutrition-queue.service.js';

app.listen(config.PORT, config.HOST, () => {
  console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
  nutritionQueue.start();
});
