const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DIALOG_URL = 'https://cpsolutions.dialog.lk/api/sms/inline/send.php';
const DIALOG_Q_TOKEN = '15737450854416';

// Simple logging middleware so we can see exactly what Keycloak sends
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Body:', JSON.stringify(req.body));
  next();
});

// Main endpoint the Keycloak SMS plugin will call
app.post('/send-sms', async (req, res) => {
  try {
    // The Keycloak plugin sends these field names based on our config:
    // message -> "message", destination -> "destination"
    // Accept a few possible field name variants defensively.
    const message = req.body.message || req.body.text;
    let destination = req.body.destination || req.body.to;

    if (!message || !destination) {
      console.error('Missing message or destination in request body:', req.body);
      return res.status(400).send('Missing message or destination');
    }

    // Dialog's API expects the number WITHOUT a leading "+"
    destination = destination.toString().replace(/^\+/, '');

    console.log(`Forwarding to Dialog -> destination=${destination}, message=${message}`);

    const dialogResponse = await axios.post(
      DIALOG_URL,
      new URLSearchParams({
        destination,
        q: DIALOG_Q_TOKEN,
        message
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    console.log('Dialog response:', dialogResponse.status, dialogResponse.data);

    // Dialog returns "0" on success based on our earlier curl test
    if (dialogResponse.data.toString().trim() === '0') {
      return res.status(200).send('OK');
    }

    // Anything else we treat as a possible failure but still return 200
    // so Keycloak doesn't retry infinitely; log clearly for debugging.
    console.warn('Unexpected Dialog response, treating as sent:', dialogResponse.data);
    return res.status(200).send('OK');

  } catch (err) {
    console.error('Error forwarding to Dialog:', err.message);
    if (err.response) {
      console.error('Dialog error response:', err.response.status, err.response.data);
    }
    return res.status(502).send('Failed to send SMS via Dialog');
  }
});

app.get('/health', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 10020;
app.listen(PORT, () => {
  console.log(`Dialog SMS proxy listening on port ${PORT}`);
});