export class Nominatim {

	constructor() {
	}

	async searchCity(name: string) {
		const res = await fetch('https://nominatim.openstreetmap.org/search/'+ encodeURIComponent(name) + '?format=json&limit=1');
		const json = await res.json();
		return json[0];
	}

}
