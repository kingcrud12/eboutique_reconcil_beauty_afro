// server.js
const express = require('express');
const fetch = require('node-fetch');
const cookie = require('cookie');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BASE_API_URL = process.env.REACT_APP_BASE_URL

app.all('/api/proxy/*', async (req, res) => {
  try {
    const path = req.url.replace('/api/proxy', '');
    const url = `${BASE_API_URL}${path}`;

    const body = ['POST', 'PUT', 'PATCH'].includes(req.method)
      ? JSON.stringify(req.body)
      : undefined;

    const apiRes = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.headers.authorization || '',
      },
      body,
      credentials: 'include',
    });

    const setCookie = apiRes.headers.get('set-cookie');
    if (setCookie) {
      const cookies = setCookie.split(', ').map(c => cookie.parse(c));
      cookies.forEach(c => {
        if (c.token) {
          res.setHeader(
            'Set-Cookie',
            cookie.serialize('token', c.token, {
              httpOnly: true,
              secure: false,
              sameSite: 'lax',
              path: '/',
              maxAge: 24 * 60 * 60,
            })
          );
        }
      });
    }

    const text = await apiRes.text();
    try {
      res.json(JSON.parse(text));
    } catch {
      res.send(text);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Proxy error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Proxy server running at http://localhost:${PORT}`));
