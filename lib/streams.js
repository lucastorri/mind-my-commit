const crypto = require('crypto');
const stream = require('stream');

class WritableHMAC extends stream.Writable {

  constructor(algorithm, key) {
    super();
    this.hmac = crypto.createHmac(algorithm, key);

    this.hmac.on('readable', () => {
      const data = this.hmac.read();
      const signature = (data || '').toString('hex');
      if (data) this.emit('signature', `${algorithm}=${signature}`);
    });
  }

  _write(data, encoding, done) {
    this.hmac.write(data, encoding, done);
  }

  end() {
    this.hmac.end();
  }

}

class WritableBuffer extends stream.Writable {

  constructor() {
    super();
    this.data = [];
  }

  _write(data, encoding, done) {
    this.data += data;
    done();
  }

  toString() {
    return new String(this.data);
  }

  toJSON() {
    return JSON.parse(this.toString());
  }

}

class MultiWritable extends stream.Writable {

  constructor(...streams) {
    super();
    this.streams = streams;
  }

  _write(data, encoding, done) {
    let written = 0;
    this.streams.forEach((stream) => {
      let called = false;
      stream._write(data, encoding, () => {
        if (!called) {
          called = true;
          written += 1;
        }
        if (written === this.streams.length) done();
      });
    });
  }

  end() {
    this.streams.forEach((stream) => stream.end());
  }

}

module.exports = {
  WritableHMAC, WritableBuffer, MultiWritable
};
