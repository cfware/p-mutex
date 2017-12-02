'use strict';

const assert = require('assert');
const PMutex = require('..');

describe('@cfware/p-mutex', () => {
	let pMutex;

	beforeEach('create pMutex', () => pMutex = new PMutex());

	it('pMutex is an object', () => assert.equal(typeof pMutex, 'object'));
	it('pMutex.lock is a function', () => assert.equal(typeof pMutex.lock, 'function'));
	it('pMutex.lock resolves', () => pMutex.lock());

	it('single request to lock', () => {
		let drained = 0;

		pMutex.on('drain', () => {
			assert.ok(!drained, 'not drained more than once');
			drained++;
		});

		return pMutex.lock().then(lock => {
			assert.equal(typeof lock.release, 'function');
			assert.ok(!drained, 'not drained');

			lock.release();
			assert.equal(drained, 1, 'drained once');
		});
	});

	it('two request happen in order', done => {
		let drained = 0;
		let event_num = 0;

		pMutex.on('drain', () => {
			assert.ok(!drained, 'not drained more than once');
			assert.equal(event_num, 2, 'correct number of events happened');
			drained++;
		});

		pMutex.lock()
			.then(lock => {
				assert.ok(!drained, 'not drained yet');
				assert.equal(event_num, 0);
				event_num = 1;

				setTimeout(() => {
					lock.release();
					setTimeout(() => {
						assert.equal(event_num, 2);
						assert.ok(!drained, 'not drained yet');
					}, 1);
				}, 5);
			})
			.catch(done);

		pMutex.lock()
			.then(lock => {
				assert.equal(event_num, 1);
				event_num = 2;
				assert.ok(!drained, 'not drained yet');
				setTimeout(() => {
					lock.release();
					assert.equal(drained, 1, 'drained now');
					done();
				}, 5);
			})
			.catch(done);
	});
});
