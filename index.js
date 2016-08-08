const http = require('http');

const streams = require('./lib/streams');
const hooks = require('./lib/hooks');

const PORT = 8050;
const SECRET = 'helloworld';

var server = http.createServer((req, res) => {
  console.log(req.url);

  const event = req.headers['x-github-event'];
  const signature = req.headers['x-hub-signature'];

  if (!event || !signature) {
    res.statusCode = 400;
    return res.end();
  }

  const hmac = new streams.WritableHMAC('sha1', SECRET);
  const buf = new streams.WritableBuffer();
  const multi = new streams.MultiWritable(hmac, buf);

  hmac.on('signature', (computedSignature) => {
    if (signature === computedSignature) {
      (hooks[event] || Function())(buf.toJSON());
    } else {
      res.statusCode = 403;
    }
    res.end();
  });

  req.pipe(multi);
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
