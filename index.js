import EventEmitter from 'events';

const kIsFirst = Symbol('PMutex.IsFirst');
const kRelease = Symbol('PMutex.Release');
const kAcquire = Symbol('PMutexUser.Acquire');

class PMutexUser {
	#owner;
	#resolve;
	#reject;

	#wait = new Promise((resolve, reject) => {
		this.#resolve = resolve;
		this.#reject = reject;
	});

	constructor(owner) {
		this.#owner = owner;
	}

	/* This is for use by PMutex.lock only. */
	[kAcquire]() {
		if (this.#owner[kIsFirst](this)) {
			this.#resolve(this);
		}

		return this.#wait;
	}

	/* Public method to be called when a user is done with the mutex. */
	release() {
		if (!this.#owner) {
			return;
		}

		const owner = this.#owner;
		this.#owner = null;
		owner[kRelease]();
	}
}

class PMutex extends EventEmitter {
	#kWaiting = [];

	[kIsFirst](usr) {
		return usr === this.#kWaiting[0];
	}

	[kRelease]() {
		this.#kWaiting.shift();
		if (this.#kWaiting.length === 0) {
			this.emit('drain');
		} else {
			this.#kWaiting[0][kAcquire]();
		}
	}

	lock() {
		const usr = new PMutexUser(this);
		this.#kWaiting.push(usr);

		return usr[kAcquire]();
	}
}

export {PMutex};
