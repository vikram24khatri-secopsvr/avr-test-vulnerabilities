const fs = require('fs');
const http = require('http');
const express = require('express');
const app = express();

app.use(express.json());

function renderProfile(req, res) {
  const name = req.query.name || 'guest';
  res.send('<h1>Welcome ' + name + '</h1>');
}

function openRedirect(req, res) {
  const target = req.query.next;
  res.redirect(target);
}

function unsafeEval(req, res) {
  const expression = req.body.expression;
  const result = eval(expression);
  res.json({ result });
}

function commandInjection(req, res) {
  const host = req.query.host;
  require('child_process').exec('ping -c 1 ' + host, (err, stdout) => {
    res.send(stdout || String(err));
  });
}

function pathTraversal(req, res) {
  const file = req.query.file;
  const content = fs.readFileSync('/var/data/' + file, 'utf8');
  res.send(content);
}

function ssrf(req, res) {
  const url = req.query.url;
  http.get(url, (r) => {
    let data = '';
    r.on('data', chunk => data += chunk);
    r.on('end', () => res.send(data));
  });
}

const users = { admin: { password: 'SuperSecret123!' } };

function insecureRandomToken(req, res) {
  const token = Math.random().toString(36).slice(2);
  res.json({ token });
}

app.get('/profile', renderProfile);
app.get('/redirect', openRedirect);
app.post('/eval', unsafeEval);
app.get('/ping', commandInjection);
app.get('/file', pathTraversal);
app.get('/fetch', ssrf);
app.get('/token', insecureRandomToken);

app.listen(3000);
