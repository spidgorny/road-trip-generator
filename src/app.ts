import {Generator} from "./generator";

import localforage from "localforage";
import {Nominatim} from "./service/Nominatim";
import {IRoute} from "./declarations";

export class App {

	generator: Generator;
	form: HTMLFormElement;
	from: string;
	to: string;
	splitAfter: number;
	fromLatLon: {
		lat: number;
		lon: number;
	};
	toLatLon: {
		lat: number;
		lon: number;
	};
	distance: number;

	constructor(generator: Generator) {
		this.generator = generator;
		this.form = document.querySelector('form#params');
		this.form.onsubmit = this.onSubmit.bind(this);
		localforage.config();
		this.loadData();
	}

	async loadData() {
		this.from = await localforage.getItem('from');
		this.to = await localforage.getItem('to');
		this.splitAfter = await localforage.getItem('splitAfter') || 2;
		console.log(this.from, this.to, this.splitAfter);
		await this.geocode();
		this.render();
	}

	async onSubmit(event: Event) {
		event.preventDefault();
		this.updateData();
		this.saveData();
		await this.geocode();
		this.render();
	}

	updateData() {
		const from = this.form.querySelector('#from') as HTMLInputElement;
		this.from = from.value;
		const to = this.form.querySelector('#to') as HTMLInputElement;
		this.to = to.value;
		const splitAfter = this.form.querySelector('#splitAfter') as HTMLInputElement;
		this.splitAfter = parseFloat(splitAfter.value);
	}

	async saveData() {
		await localforage.setItem('from', this.from);
		await localforage.setItem('to', this.to);
		await localforage.setItem('splitAfter', this.splitAfter);
	}

	async geocode() {
		const geocoder = new Nominatim();
		this.fromLatLon = await geocoder.searchCity(this.from);
		// console.log(this.fromLatLon);

		this.toLatLon = await geocoder.searchCity(this.to);
		// console.log(this.toLatLon);
	}

	updateForm() {
		const from = this.form.querySelector('#from') as HTMLInputElement;
		from.value = this.from;

		const fromLatLon = this.form.querySelector('#fromLatLon') as HTMLOutputElement;
		fromLatLon.value = this.outputLatLon(this.fromLatLon);

		const to = this.form.querySelector('#to') as HTMLInputElement;
		to.value = this.to;

		const toLatLon = this.form.querySelector('#toLatLon') as HTMLOutputElement;
		toLatLon.value = this.outputLatLon(this.toLatLon);

		const splitAfter = this.form.querySelector('#splitAfter') as HTMLInputElement;
		splitAfter.value = this.splitAfter.toFixed(2);

		const distance = this.form.querySelector('#distance') as HTMLOutputElement;
		distance.value = (this.distance / 1000).toFixed(2);

	}

	private outputLatLon(json) {
		return JSON.stringify({
			lat: json.lat,
			lon: json.lon,
			name: json.display_name,
		}, null, 2);
	}

	async render() {
		this.updateForm();
		this.generator.setFrom(this.fromLatLon.lat, this.fromLatLon.lon);
		this.generator.setTo(this.toLatLon.lat, this.toLatLon.lon);
		this.generator.setSplitAfter(this.splitAfter);
		this.generator.afterRouting(this.updateAfterRouting.bind(this));
		this.generator.startRouting();
	}

	updateAfterRouting(route: IRoute) {
		this.distance = route.distance;
		this.updateForm();
	}

}
