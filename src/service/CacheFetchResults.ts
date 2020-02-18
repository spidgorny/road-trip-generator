import localforage from "localforage";

export class CacheFetchResults {

	isReady: boolean = false;

	cache: {
		[key: string]: any;
	} = [];

	constructor() {
		this.fetchCache();
	}

	async fetchCache() {
		if (this.isReady) {
			return;
		}
		this.cache = await localforage.getItem('CacheFetchResults') || [];
		this.isReady = true;
	}

	getFunction() {
		return this.fetch.bind(this);
	}

	async fetch(url, options: any = {}) {
		if (url in this.cache) {
			return this.cache[url];
		}
		const res = await fetch(url, options);
		const data = await res.json();
		this.cache[url] = data;
		await this.storeCache();
		return data;
	}

	async storeCache() {
		await localforage.setItem('CacheFetchResults', this.cache);
	}

}
