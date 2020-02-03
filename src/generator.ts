import React, { useState } from '/web_modules/react.js';

// var L = import('leaflet');
// import('leaflet-routing-machine');
declare var L: any;

interface Waypoint {
	options: {
		"allowUTurn": boolean;
	},
	latLng: {
		lat: number;
		lng: number;
	};
	_initHooksCalled: boolean;
	name: string;
}

interface IRoute {
	name: string;
	coordinates: [];
	instructions: [];
	summary: {
		totalDistance: number;
		totalTime: number;
	};
	inputWaypoints: Waypoint[];
	waypoints: Waypoint[];
	properties: any;
}

class Generator {
	map;

	fromTo = [
		L.latLng(57.74, 11.94),
		L.latLng(57.6792, 11.949)
	];

	constructor() {
		this.map = L.map('map');
		new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(this.map);

		this.map.setView([51.505, -0.09], 13);

		L.control.scale().addTo(this.map);
	}

	get waypoints() {
			return this.fromTo.map((pos) => {
			return new L.Routing.Waypoint(pos);
		});
	}

	/// @deprecated
	showControl() {
		const control = L.Routing.control({
			waypoints: this.waypoints,
			routeWhileDragging: true
		});
		control.addTo(this.map);

		control.addEventListener('routesfound', (e) => {
			console.log('routesfound', e);
		});
	}

	startRouting() {
		const plan = new L.Routing.Plan(this.waypoints, {});
		if (plan.isReady()) {
			plan.addEventListener('waypointgeocoded', (e) => {
				console.log('waypointgeocoded', e);
			});
			const osrm = new L.Routing.osrmv1();
			osrm.route(this.waypoints, (err?, routes?: IRoute[]) => {
				if (err) {
					throw new Error(err.toString());
				}
				this.renderRoutes(routes);
			});
		}
	}

	async demoRouting() {
		const plan = new L.Routing.Plan(this.waypoints, {});
		if (plan.isReady()) {
			const json = await fetch('src/demoRoute.json');
			let routes = await json.json();
			routes = routes.map((route: IRoute) => {
				route.inputWaypoints = route.inputWaypoints.map((wp) => {
					return new L.Routing.Waypoint(wp.latLng, wp.name, wp.options);
				});
				return route;
			});
			this.renderRoutes(routes);
		}
	}

	renderRoutes(routes: IRoute[]) {
		console.log('routes', routes);
		for (const route of routes) {
			const line = new L.Routing.Line(route);
			line.addTo(this.map);
			this.map.fitBounds(line.getBounds());
		}
	}

}

new Generator().demoRouting();
