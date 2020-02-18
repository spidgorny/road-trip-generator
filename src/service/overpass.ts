import {LatLng, OverpassResponse} from "../declarations";
import {CacheFetchResults} from "./CacheFetchResults";
// import {createfetchUnlessCached} from "fetch-unless-cached"

export class Overpass {

	baseUrl = 'http://overpass-api.de/api';

	location: LatLng;
	radius: number;

	cache: CacheFetchResults;
	cachedFetch: any;

	constructor(location: any, radius: number) {
		this.location = location;
		this.radius = radius;
		// this.cachedFetch = createfetchUnlessCached(3000); // minutes
		this.cache = new CacheFetchResults();
		this.cachedFetch = this.cache.getFunction();
	}

	get script() {
		return `[out:json];
(node(around:${this.radius},${this.location.lat},${this.location.lng})["place"="town"];
node(around:${this.radius},${this.location.lat},${this.location.lng})["place"="city"];);
out;`;
	}

	async awaitSlots() {
		const url = this.baseUrl + '/status';
		const json = await fetch(url);
		const data = await json.text();
		const isAvailable = data.includes('slots available now');
		// console.log('isAvailable', isAvailable);
		if (isAvailable) {
			return true;
		}

		const inXseconds = data.match(/in (\d+) seconds/);
		// console.log('inXseconds', inXseconds);
		await this.pause(inXseconds[1]);
		return true;
	}

	async pause(seconds) {
		return new Promise((resolve) => {
			window.setTimeout(resolve, seconds * 1000);
		});
	}

	async fetch(): Promise<OverpassResponse> {
		await this.cache.fetchCache();	// make sure cache is initialized
		await this.awaitSlots();
		// console.log(this.script);
		const url = this.baseUrl + '/interpreter?data=' + encodeURIComponent(this.script);
		const data = await this.cachedFetch(url);
		// console.log(data);
		return data;
	}

}
