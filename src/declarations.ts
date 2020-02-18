export interface LatLng {
	lat: number;
	lng: number;
}

export interface Waypoint {
	options: {
		"allowUTurn": boolean;
	},
	latLng: LatLng;
	_initHooksCalled: boolean;
	name: string;
}

export interface Instruction {
	type: string;
	distance: number;
	time: number;
	road: string;
	direction: string;
	index: number;
	mode: string;
	text: string;
}

export interface IRoute {
	name: string;
	coordinates: [];
	instructions: Instruction[];
	summary: {
		totalDistance: number;
		totalTime: number;
	};
	inputWaypoints: Waypoint[];
	waypoints: Waypoint[];
	properties: any;
	distance: number;
	duration: number;
	weight: number;
}

export interface Section {
	time: number;
	instructions: Instruction[];
	start: LatLng;
	finish: LatLng;
	coordinates: any[];
}


export interface CityDetails {
	divipola: string;
	'is_in:continent': string;
	'is_in:country': string;
	'is_in:country_code': string;
	'is_in:state': string;
	name: string;
	'name:en': string;
	'name:ru': string;
	'name:uk': string;
	note: string;
	place: string;
	source: string;
	wikidata: string;
	wikipedia: string;
}

export interface OverpassCity {
	type: string;
	id: number;
	lat: number;
	lon: number;
	tags: CityDetails;
}

export interface OverpassResponse {
	version: number;
	generator: string;
	osm3s: {
		timestamp_osm_base: string;
		copyright: string;
	}
	elements: OverpassCity[];
}
