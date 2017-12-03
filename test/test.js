'use strict';

const assert = require('assert');
const {describe, beforeEach, it} = require('mocha');
const PMutex = require('..');

describe('@cfware/p-mutex', () => {
	let pMutex;

	beforeEach('create pMutex', () => {
		pMutex = new PMutex();
	});

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
		let eventNum = 0;

		pMutex.on('drain', () => {
			assert.ok(!drained, 'not drained more than once');
			assert.equal(eventNum, 2, 'correct number of events happened');
			drained++;
		});

		pMutex.lock()
			.then(lock => afterFirstLock(lock))
			.catch(err => done(err));

		pMutex.lock()
			.then(lock => afterSecondLock(lock))
			.catch(err => done(err));

		function afterFirstLock(lock) {
			assert.ok(!drained, 'not drained yet');
			assert.equal(eventNum, 0);
			eventNum = 1;

			setTimeout(() => {
				lock.release();
				setTimeout(() => {
					assert.equal(eventNum, 2);
					assert.ok(!drained, 'not drained yet');
				}, 1);
			}, 5);
		}

		function afterSecondLock(lock) {
			assert.equal(eventNum, 1);
			eventNum = 2;
			assert.ok(!drained, 'not drained yet');

			setTimeout(() => {
				lock.release();
				assert.equal(drained, 1, 'drained now');
				done();
			}, 5);
		}
	});
});
