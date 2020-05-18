# @cfware/p-mutex [![NPM Version][npm-image]][npm-url]

Promise based mutex

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


[npm-image]: https://img.shields.io/npm/v/@cfware/p-mutex.svg
[npm-url]: https://npmjs.org/package/@cfware/p-mutex
