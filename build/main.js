'use strict';

class Overpass {
    constructor(location, radius) {
        this.baseUrl = 'http://overpass-api.de/api';
        this.location = location;
        this.radius = radius;
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
        console.log('isAvailable', isAvailable);
        if (isAvailable) {
            return true;
        }
        const inXseconds = data.match(/in (\d+) seconds/);
        console.log('inXseconds', inXseconds);
        await this.pause(inXseconds[1]);
        return true;
    }
    async pause(seconds) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, seconds * 1000);
        });
    }
    async fetch() {
        await this.awaitSlots();
        console.log(this.script);
        const url = this.baseUrl + '/interpreter?data=' + encodeURIComponent(this.script);
        const json = await fetch(url);
        const data = await json.json();
        // console.log(data);
        return data;
    }
}

class Route {
    constructor(map, route) {
        this.map = map;
        this.route = route;
        // const line = new L.Routing.Line(route);
        // line.addTo(this.map);
        // this.map.fitBounds(line.getBounds());
    }
    async render() {
        let sections = this.calculateSteps();
        sections = this.expandSections(sections);
        this.renderSections(sections);
        await this.fetchCities(sections);
    }
    calculateSteps(minTime = 60 * 10, maxTime = 60 * 60) {
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
                newSection = [step]; // continue where we left
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
    expandSections(sections) {
        for (const section of sections) {
            let iStart = section.instructions[0].index;
            section.start = this.route.coordinates[iStart];
            let iEnd = section.instructions[section.instructions.length - 1].index;
            section.finish = this.route.coordinates[iEnd];
            const latlngs = this.sectionToPolyline(section);
            section.coordinates = latlngs;
        }
        return sections;
    }
    sectionToPolyline(section) {
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
            indexFrom = step.index; // continuation
        }
        // console.log('latlngs', latlngs);
        return latlngs;
    }
    renderSections(sections) {
        for (const section of sections) {
            L.marker(section.start).addTo(this.map);
            L.marker(section.finish).addTo(this.map);
            const polyline = L.polyline(section.coordinates, { color: 'red' });
            polyline.addTo(this.map);
        }
    }
    async fetchCities(sections) {
        for (const section of sections) {
            const overpass = new Overpass(section.finish, 10000);
            const cities = await overpass.fetch();
            console.log('around', section.finish, cities.elements.length);
            this.renderCities(cities.elements);
        }
    }
    renderCities(cities) {
        for (const city of cities) {
            console.log(city);
            const pos = new L.LatLng(city.lat, city.lon);
            L.circleMarker(pos).addTo(this.map);
        }
    }
}

class Generator {
    constructor() {
        this.fromTo = [
            L.latLng(57.74, 11.94),
            L.latLng(57.6792, 11.949),
        ];
        this.map = L.map('map');
        new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        // this.map.setView([51.505, -0.09], 13);
        L.control.scale().addTo(this.map);
        this.map.fitBounds(this.bounds);
    }
    get bounds() {
        const bounds = L.latLngBounds();
        this.fromTo.map((pos) => {
            bounds.extend(pos);
        });
        return bounds;
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
            osrm.route(this.waypoints, (err, routes) => {
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
            // fix after JSON serialization
            routes = routes.map((route) => {
                route.inputWaypoints = route.inputWaypoints.map((wp) => {
                    return new L.Routing.Waypoint(wp.latLng, wp.name, wp.options);
                });
                return route;
            });
            this.renderRoutes(routes);
        }
    }
    renderRoutes(routes) {
        // console.log('routes', routes);
        for (const route of routes) {
            new Route(this.map, route).render();
            break;
        }
    }
}
//# sourceMappingURL=generator.js.map

// new Generator().startRouting();
new Generator().demoRouting();
//# sourceMappingURL=main.js.map
