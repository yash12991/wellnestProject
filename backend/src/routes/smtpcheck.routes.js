import express from 'express';
import dns from 'dns';
import net from 'net';

const router = express.Router();

// GET /v1/api/_debug/smtp-check
// Attempts a TCP connection to the configured SMTP host:port and returns diagnostic info.
router.get('/_debug/smtp-check', async (req, res) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const timeoutMs = req.query.timeout ? parseInt(req.query.timeout, 10) : 10000;

  const result = {
    smtpHost,
    smtpPort,
    timeoutMs,
    dns: null,
    connect: null,
  };

  // 1) DNS lookup
  try {
    const addresses = await new Promise((resolve, reject) => {
      dns.lookup(smtpHost, { all: true }, (err, addrs) => {
        if (err) return reject(err);
        resolve(addrs);
      });
    });
    result.dns = addresses;
  } catch (err) {
    result.dns = { error: err && err.message ? err.message : String(err) };
    return res.status(200).json({ ok: false, result, note: 'DNS lookup failed — indicates DNS issue from runtime' });
  }

  // 2) TCP connect
  const socket = new net.Socket();
  let settled = false;

  const cleanup = () => {
    try { socket.destroy(); } catch (e) {}
  };

  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    result.connect = { ok: false, error: 'timeout' };
    cleanup();
    return res.status(200).json({ ok: false, result, note: 'Connection timed out — likely outbound network blocked' });
  }, timeoutMs);

  socket.once('error', (err) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    result.connect = { ok: false, error: err && err.message ? err.message : String(err) };
    cleanup();
    return res.status(200).json({ ok: false, result, note: 'TCP connect failed' });
  });

  socket.connect(smtpPort, smtpHost, () => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    result.connect = { ok: true, message: 'connected' };
    cleanup();
    return res.status(200).json({ ok: true, result, note: 'TCP connect succeeded — SMTP host reachable on given port' });
  });
});

export default router;
