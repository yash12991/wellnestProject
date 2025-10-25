import serverless from 'serverless-http';
import app from '../index.js';

// serverless-http wraps the Express app into a function Vercel can call.
export default serverless(app);
