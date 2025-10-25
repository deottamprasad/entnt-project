import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';

// 1. Import the worker and the seeder
import { worker } from './mocks/browser.js';
import { seedDatabase } from './seeder.js';

/**
 * Initializes the mock API and database before rendering the app.
 */
async function startApp() {
  console.log('Starting application...');

  // 2. Start the MSW mock server
  // We use "onUnhandledRequest: 'bypass'" so that requests for CSS, etc., pass through.
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
  console.log('MSW worker started.');

  // 3. Run the database seeder (it has a check to only run once)
  await seedDatabase();

  // 4. Render the React app *after* the async setup
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log('React app rendered.');
}

// 5. Call the start function to run the app
startApp();