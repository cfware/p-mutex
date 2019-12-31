import {promisify} from 'util';
import t from 'libtap';
import {PMutex} from './index.mjs';

const delay = promisify(setTimeout);

t.test('pMutex is an object', async t => {
	const pMutex = new PMutex();
	t.type(pMutex, 'object');
	t.type(pMutex.lock, 'function');
});

t.test('pMutex.lock resolves', async () => {
	const pMutex = new PMutex();
	await pMutex.lock();
});

t.test('single request to lock', async t => {
	const pMutex = new PMutex();
	let drained = 0;

	pMutex.on('drain', () => {
		t.equal(drained, 0);
		drained++;
	});

	const lock = await pMutex.lock();
	t.type(lock.release, 'function');
	t.equal(drained, 0);
	lock.release();
	t.equal(drained, 1);
});

t.test('two request happen in order', async t => {
	const pMutex = new PMutex();
	let drained = 0;
	let eventNumber = 0;

	async function createFirstLock() {
		const lock = await pMutex.lock();

		t.equal(drained, 0);
		t.equal(eventNumber, 0);
		eventNumber++;

		await delay(5);
		lock.release();

		await delay(1);
		t.equal(eventNumber, 2);
		t.equal(drained, 0);
	}

	async function createSecondLock() {
		const lock = await pMutex.lock();

		t.equal(drained, 0);
		t.equal(eventNumber, 1);
		eventNumber++;

		await delay(5);

		lock.release();
		t.equal(drained, 1, 'drained now');
		lock.release();
	}

	pMutex.on('drain', () => {
		t.equal(drained, 0);
		t.equal(eventNumber, 2);
		drained++;
	});

	await Promise.all([
		createFirstLock(),
		createSecondLock()
	]);
});
