import {LatLng, OverpassResponse} from "./declarations";

export class Overpass {

	baseUrl = 'http://overpass-api.de/api/interpreter?data=';

	location: LatLng;
	radius: number;

	constructor(location: any, radius: number) {
		this.location = location;
		this.radius = radius;

	}

	get script() {
		return `[out:json];
node(${this.location.lat-0.5},${this.location.lng-0.5},${this.location.lat+0.5},${this.location.lng+0.5})->.center;
(node(around.center:${this.radius})["place"="town"];
node(around.center:${this.radius})["place"="village"];);
out;`;
	}

	async fetch(): Promise<OverpassResponse> {
		console.log(this.script);
		const url = this.baseUrl + encodeURIComponent(this.script);
		const json = await fetch(url);
		const data = await json.json();
		// console.log(data);
		return data;
	}

}
