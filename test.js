'use strict';

import test from 'ava';
import PMutex from '.';

test.beforeEach('create pMutex', t => {
	t.context.pMutex = new PMutex();
});

test('pMutex is an object', t => t.is(typeof t.context.pMutex, 'object'));

test('pMutex.lock is a function', t => t.is(typeof t.context.pMutex.lock, 'function'));
test('pMutex.lock resolves', async t => {
	await t.notThrowsAsync(t.context.pMutex.lock());
});

test('single request to lock', async t => {
	const {pMutex} = t.context;
	let drained = 0;

	pMutex.on('drain', () => {
		t.is(drained, 0);
		drained++;
	});

	const lock = await pMutex.lock();
	t.is(typeof lock.release, 'function');
	t.is(drained, 0);
	lock.release();
	t.is(drained, 1);
});

test('two request happen in order', async t => {
	const {pMutex} = t.context;
	let drained = 0;
	let eventNum = 0;

	pMutex.on('drain', () => {
		t.is(drained, 0);
		t.is(eventNum, 2);
		drained++;
	});

	const firstLock = pMutex.lock();
	const secondLock = pMutex.lock();

	firstLock.then(lock => {
		t.is(drained, 0);
		t.is(eventNum, 0);
		eventNum++;

		setTimeout(() => {
			lock.release();
			setTimeout(() => {
				t.is(eventNum, 2);
				t.is(drained, 0);
			}, 1);
		}, 5);
	});

	const finish = secondLock.then(lock => {
		t.is(drained, 0);
		t.is(eventNum, 1);
		eventNum++;

		return new Promise(resolve => {
			setTimeout(() => {
				lock.release();
				t.is(drained, 1, 'drained now');
				resolve();
			}, 5);
		});
	});

	await t.notThrowsAsync(firstLock);
	await t.notThrowsAsync(secondLock);
	await t.notThrowsAsync(finish);
});
