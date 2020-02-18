import {IRoute, OverpassCity, Section} from "./declarations";
import {Overpass} from "./service/overpass";

declare var L: any;

export class Route {

	map: any;
	route: IRoute;
	splitAfter: number;

	constructor(map, route: IRoute, splitAfter: number) {
		this.map = map;
		this.route = route;
		this.splitAfter = splitAfter;
		// const line = new L.Routing.Line(route);
		// line.addTo(this.map);
		// this.map.fitBounds(line.getBounds());
	}

	async render() {
		let sections = this.calculateSteps(this.splitAfter * 60 * 60, this.splitAfter * 2 * 60 * 60);
		sections = this.expandSections(sections);
		this.renderSections(sections);
		await this.fetchCities(sections);
	}

	calculateSteps(minTime = 60*10, maxTime = 60*60) {
		const sections = [];

		let accumulator = 0;
		let newSection = [];
		for (const step of this.route.instructions) {
			newSection.push(step);
			accumulator += step.time;
			if (accumulator > minTime) {
				sections.push({
					time: accumulator,
					instructions: newSection
				});
				newSection = [step];	// continue where we left
				accumulator = 0;
			}
		}
		if (accumulator > 0) {
			sections.push({
				time: accumulator,
				instructions: newSection
			});
		}
		// console.log('sections', sections);
		return sections;
	}

	expandSections(sections: Section[]) {
		for (const section of sections) {
			let iStart = section.instructions[0].index;
			section.start = this.route.coordinates[iStart];

			let iEnd = section.instructions[section.instructions.length-1].index;
			section.finish = this.route.coordinates[iEnd];

			const latlngs = this.sectionToPolyline(section);
			section.coordinates = latlngs;
		}
		return sections;
	}

	sectionToPolyline(section: Section) {
		let latlngs = [];
		let indexFrom = null;
		for (const step of section.instructions) {
			if (indexFrom === null) {
				indexFrom = step.index;
				continue;
			}
			const range = this.route.coordinates.slice(indexFrom, step.index);
			// console.log('range', indexFrom, step.index, range.length);
			latlngs = latlngs.concat(range);

			indexFrom = step.index;	// continuation
		}
		// console.log('latlngs', latlngs);
		return latlngs;
	}

	renderSections(sections: Section[]) {
		for (const section of sections) {
			L.marker(section.start).addTo(this.map);
			L.marker(section.finish).addTo(this.map);

			const polyline = L.polyline(section.coordinates, {color: 'red'});
			polyline.addTo(this.map);
		}
	}

	private async fetchCities(sections: Section[]) {
		for (const section of sections) {
			const overpass = new Overpass(section.finish, 10000);
			const cities = await overpass.fetch();
			console.log('around', section.finish, cities.elements.length);
			this.renderCities(cities.elements);
		}
	}

	renderCities(cities: OverpassCity[]) {
		for (const city of cities) {
			console.log(city);
			const pos = new L.LatLng(city.lat, city.lon);
			L.circleMarker(pos).addTo(this.map);
		}
	}

}
