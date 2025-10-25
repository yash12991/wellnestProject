import express from 'express';
import { sendTestMail } from '../config/email.js';

const router = express.Router();

// Temporary debug endpoint to trigger the test mail and return result.
// POST /v1/api/_debug/send-test-mail
router.post('/_debug/send-test-mail', async (req, res) => {
  try {
    const result = await sendTestMail();
    if (result) return res.json({ ok: true, message: 'Test mail sent (check logs or recipient inbox)' });
    return res.status(500).json({ ok: false, message: 'sendTestMail returned false — check server logs for error details' });
  } catch (err) {
    console.error('[debug] send-test-mail error:', err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : String(err) });
  }
});

export default router;
