# @cfware/p-mutex

[![Travis CI][travis-image]][travis-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/cfware/p-mutex.svg)](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

CFWare queue_log mysql writer

### Install @cfware/p-mutex

This module requires node.js 4 or above.

```sh
npm i --save @cfware/p-mutex
```

## Usage

```js
'use strict';

const PMutex = require('@cfware/p-mutex');

/* PMutex ignores any parameters. */
const mutex = new PMutex();

const serializedAsyncAction = async () => {
	const lock = await mutex.lock();

	/* Do some stuff, release the lock eventually. */
	setTimeout(() => lock.release(), 10);
}

module.exports = serializedAsyncAction;
```

This module does not provide timeout functionality.  `lock.release()` must be
called or the `mutex.lock()` will never resolve again.

## Running tests

Tests are provided by eslint and mocha.

```sh
npm install
npm test
```

[npm-image]: https://img.shields.io/npm/v/@cfware/p-mutex.svg
[npm-url]: https://npmjs.org/package/@cfware/p-mutex
[travis-image]: https://travis-ci.org/cfware/p-mutex.svg?branch=master
[travis-url]: https://travis-ci.org/cfware/p-mutex
[downloads-image]: https://img.shields.io/npm/dm/@cfware/p-mutex.svg
[downloads-url]: https://npmjs.org/package/@cfware/p-mutex
[license-image]: https://img.shields.io/github/license/cfware/p-mutex.svg
