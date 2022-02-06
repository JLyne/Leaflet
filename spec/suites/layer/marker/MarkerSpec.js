describe('Marker', () => {
	let map,
	    container,
	    icon1,
	    icon2;

	beforeEach(() => {
		container = container = createContainer();
		map = L.map(container);

		map.setView([0, 0], 0);
		icon1 = new L.Icon.Default();
		icon2 = new L.Icon.Default({
			iconUrl: `${icon1.options.iconUrl}?2`,
		});
	});

	afterEach(() => {
		removeMapContainer(map, container);
	});

	describe('#setIcon', () => {

		it('set the correct x and y size attributes', () => {
			const expectedX = 96;
			const expectedY = 100;
			const sizedIcon = new L.Icon.Default({
				iconUrl: `${icon1.options.iconUrl}?3`,
				iconSize: [expectedX, expectedY]
			});

			const marker = L.marker([0, 0], {icon: sizedIcon});
			map.addLayer(marker);

			const icon = marker._icon;

			expect(icon.style.width).to.be(`${expectedX}px`);
			expect(icon.style.height).to.be(`${expectedY}px`);
		});

		it('set the correct x and y size attributes passing only one value', () => {
			const expectedXY = 96;
			const sizedIcon = new L.Icon.Default({
				iconUrl: `${icon1.options.iconUrl}?3`,
				iconSize: expectedXY
			});

			const marker = L.marker([0, 0], {icon: sizedIcon});
			map.addLayer(marker);

			const icon = marker._icon;

			expect(icon.style.width).to.be(`${expectedXY}px`);
			expect(icon.style.height).to.be(`${expectedXY}px`);
		});

		it('set the correct x and y size attributes passing a L.Point instance', () => {
			const expectedXY = 96;
			const sizedIcon = new L.Icon.Default({
				iconUrl: `${icon1.options.iconUrl}?3`,
				iconSize: L.point(expectedXY, expectedXY)
			});

			const marker = L.marker([0, 0], {icon: sizedIcon});
			map.addLayer(marker);

			const icon = marker._icon;

			expect(icon.style.width).to.be(`${expectedXY}px`);
			expect(icon.style.height).to.be(`${expectedXY}px`);
		});

		it('changes the icon to another image while re-using the IMG element', () => {
			const marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);

			const beforeIcon = marker._icon;
			marker.setIcon(icon2);
			const afterIcon = marker._icon;

			expect(beforeIcon).to.be(afterIcon); // Check that the <IMG> element is re-used
			expect(afterIcon.src).to.contain(icon2._getIconUrl('icon'));
		});

		it('reuses the icon when changing icon', () => {
			const marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);
			const oldIcon = marker._icon;

			marker.setIcon(icon2);

			expect(oldIcon).to.be(marker._icon);

			expect(marker._icon.parentNode).to.be(map._panes.markerPane);
		});

		it('sets the alt attribute to a default value when no alt text is passed', () => {
			const marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);
			const icon = marker._icon;
			expect(icon.hasAttribute('alt')).to.be(true);
			expect(icon.alt).to.be('Marker');
		});
	});

	describe('#setLatLng', () => {
		it('fires a move event', () => {

			const marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);

			const beforeLatLng = marker._latlng;
			const afterLatLng = new L.LatLng(1, 2);

			let eventArgs = null;
			marker.on('move', (e) => {
				eventArgs = e;
			});

			marker.setLatLng(afterLatLng);

			expect(eventArgs).to.not.be(null);
			expect(eventArgs.oldLatLng).to.be(beforeLatLng);
			expect(eventArgs.latlng).to.be(afterLatLng);
			expect(marker.getLatLng()).to.be(afterLatLng);
		});
	});

	describe('events', () => {
		it('fires click event when clicked', () => {
			const spy = sinon.spy();

			const marker = L.marker([0, 0]).addTo(map);

			marker.on('click', spy);
			UIEventSimulator.fire('click', marker._icon);

			expect(spy.called).to.be.ok();
		});

		it('do not propagate click event', () => {
			const spy = sinon.spy();
			const spy2 = sinon.spy();
			const mapSpy = sinon.spy();
			const marker = L.marker([55.8, 37.6]);
			map.addLayer(marker);
			marker.on('click', spy);
			marker.on('click', spy2);
			map.on('click', mapSpy);
			UIEventSimulator.fire('click', marker._icon);
			expect(spy.called).to.be.ok();
			expect(spy2.called).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

		it('do not propagate dblclick event', () => {
			const spy = sinon.spy();
			const spy2 = sinon.spy();
			const mapSpy = sinon.spy();
			const marker = L.marker([55.8, 37.6]);
			map.addLayer(marker);
			marker.on('dblclick', spy);
			marker.on('dblclick', spy2);
			map.on('dblclick', mapSpy);
			UIEventSimulator.fire('dblclick', marker._icon);
			expect(spy.called).to.be.ok();
			expect(spy2.called).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

		it('do not catch event if it does not listen to it', (done) => {
			const marker = L.marker([55, 37]);
			map.addLayer(marker);
			marker.once('mousemove', (e) => {
				// It should be the marker coordinates
				expect(e.latlng.equals(marker.getLatLng())).to.be.equal(true);
			});
			UIEventSimulator.fire('mousemove', marker._icon);

			map.once('mousemove', (e) => {
				// It should be the mouse coordinates, not the marker ones
				expect(e.latlng.equals(marker.getLatLng())).to.be.equal(false);
				done();
			});
			UIEventSimulator.fire('mousemove', marker._icon);
		});
	});
});
