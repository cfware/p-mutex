# @cfware/p-mutex

[![Travis CI][travis-image]][travis-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/cfware/p-mutex.svg)](https://greenkeeper.io/)
[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![MIT][license-image]](LICENSE)

Promise based mutex

### Install @cfware/p-mutex

This module requires node.js 12 or above and ESM support (currently recommend using
the `esm` module).

```sh
npm i --save @cfware/p-mutex
```

## Usage

```js
import {PMutex} from '@cfware/p-mutex';

/* PMutex ignores any parameters. */
const mutex = new PMutex();

export const serializedAsyncAction = async () => {
	const lock = await mutex.lock();

	/* Do some stuff, release the lock eventually. */
	setTimeout(() => lock.release(), 10);
}
```

This module does not provide timeout functionality.  `lock.release()` must be
called or the `mutex.lock()` will never resolve again.

## Running tests

Tests are provided by xo and ava with coverage checking by nyc.

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
