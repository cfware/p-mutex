'use strict';

const events = require('events');

const kWaiting = Symbol('PMutex.Waiting');
const kAcquire = Symbol('PMutexUser.Acquire');

class PMutexUser {
	constructor(owner) {
		this._owner = owner;
		this._wait = new Promise((resolve, reject) => {
			this._resolve = resolve;
			this._reject = reject;
		});
		owner[kWaiting].push(this);
	}

	/* This is for use by PMutex.lock only. */
	[kAcquire]() {
		if (this._owner[kWaiting][0] === this) {
			this._resolve(this);
		}

		return this._wait;
	}

	/* Public method to be called when a user is done with the mutex. */
	release() {
		const owner = this._owner;
		const queue = owner[kWaiting];

		this._owner = null;
		queue.shift();
		if (queue.length === 0) {
			owner.emit('drain');
		} else {
			queue[0][kAcquire]();
		}
	}
}

class PMutex extends events {
	constructor() {
		super();

		this[kWaiting] = [];
	}

	lock() {
		const usr = new PMutexUser(this);

		return usr[kAcquire]();
	}
}

module.exports = PMutex;
