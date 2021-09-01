describe("Marker", function () {
	var map,
	    container,
	    icon1,
	    icon2;

	beforeEach(function () {
		container = container = createContainer();
		map = L.map(container);

		map.setView([0, 0], 0);
		icon1 = new L.Icon.Default();
		icon2 = new L.Icon.Default({
			iconUrl: icon1.options.iconUrl + '?2',
			shadowUrl: icon1.options.shadowUrl + '?2'
		});
	});

	afterEach(function () {
		removeMapContainer(map, container);
	});

	describe("#setIcon", function () {

		it("set the correct x and y size attributes", function () {
			var expectedX = 96;
			var expectedY = 100;
			var sizedIcon = new L.Icon.Default({
				iconUrl: icon1.options.iconUrl + '?3',
				iconSize: [expectedX, expectedY]
			});

			var marker = L.marker([0, 0], {icon: sizedIcon});
			map.addLayer(marker);

			var icon = marker._icon;

			expect(icon.style.width).to.be(expectedX + 'px');
			expect(icon.style.height).to.be(expectedY + 'px');
		});

		it("set the correct x and y size attributes passing only one value", function () {
			var expectedXY = 96;
			var sizedIcon = new L.Icon.Default({
				iconUrl: icon1.options.iconUrl + '?3',
				iconSize: expectedXY
			});

			var marker = L.marker([0, 0], {icon: sizedIcon});
			map.addLayer(marker);

			var icon = marker._icon;

			expect(icon.style.width).to.be(expectedXY + 'px');
			expect(icon.style.height).to.be(expectedXY + 'px');
		});

		it("set the correct x and y size attributes passing a L.Point instance", function () {
			var expectedXY = 96;
			var sizedIcon = new L.Icon.Default({
				iconUrl: icon1.options.iconUrl + '?3',
				iconSize: L.point(expectedXY, expectedXY)
			});

			var marker = L.marker([0, 0], {icon: sizedIcon});
			map.addLayer(marker);

			var icon = marker._icon;

			expect(icon.style.width).to.be(expectedXY + 'px');
			expect(icon.style.height).to.be(expectedXY + 'px');
		});

		it("changes the icon to another image while re-using the IMG element", function () {
			var marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);

			var beforeIcon = marker._icon;
			marker.setIcon(icon2);
			var afterIcon = marker._icon;

			expect(beforeIcon).to.be(afterIcon); // Check that the <IMG> element is re-used
			expect(afterIcon.src).to.contain(icon2._getIconUrl('icon'));
		});

		it('reuses the icon/shadow when changing icon', () => {
			const marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);
			var oldIcon = marker._icon;
			var oldShadow = marker._shadow;

			marker.setIcon(icon2);

			expect(oldIcon).to.be(marker._icon);
			expect(oldShadow).to.be(marker._shadow);

			expect(marker._icon.parentNode).to.be(map._panes.markerPane);
			expect(marker._shadow.parentNode).to.be(map._panes.shadowPane);
		});

		it("sets the alt attribute to a default value when no alt text is passed", function () {
			var marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);
			var icon = marker._icon;
			expect(icon.hasAttribute('alt')).to.be(true);
			expect(icon.alt).to.be('Marker');
		});
	});

	describe("#setLatLng", function () {
		it("fires a move event", function () {

			var marker = L.marker([0, 0], {icon: icon1});
			map.addLayer(marker);

			var beforeLatLng = marker._latlng;
			var afterLatLng = new L.LatLng(1, 2);

			var eventArgs = null;
			marker.on('move', function (e) {
				eventArgs = e;
			});

			marker.setLatLng(afterLatLng);

			expect(eventArgs).to.not.be(null);
			expect(eventArgs.oldLatLng).to.be(beforeLatLng);
			expect(eventArgs.latlng).to.be(afterLatLng);
			expect(marker.getLatLng()).to.be(afterLatLng);
		});
	});

	describe('events', function () {
		it('fires click event when clicked', function () {
			var spy = sinon.spy();

			var marker = L.marker([0, 0]).addTo(map);

			marker.on('click', spy);
			happen.click(marker._icon);

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
			happen.click(marker._icon);
			expect(spy.called).to.be.ok();
			expect(spy2.called).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

		it("do not propagate dblclick event", function () {
			var spy = sinon.spy();
			var spy2 = sinon.spy();
			var mapSpy = sinon.spy();
			var marker = L.marker([55.8, 37.6]);
			map.addLayer(marker);
			marker.on('dblclick', spy);
			marker.on('dblclick', spy2);
			map.on('dblclick', mapSpy);
			happen.dblclick(marker._icon);
			expect(spy.called).to.be.ok();
			expect(spy2.called).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

		it("do not catch event if it does not listen to it", function (done) {
			var marker = L.marker([55, 37]);
			map.addLayer(marker);
			marker.once('mousemove', function (e) {
				// It should be the marker coordinates
				expect(e.latlng.equals(marker.getLatLng())).to.be.equal(true);
			});
			happen.mousemove(marker._icon);

			map.once('mousemove', function (e) {
				// It should be the mouse coordinates, not the marker ones
				expect(e.latlng.equals(marker.getLatLng())).to.be.equal(false);
				done();
			});
			happen.mousemove(marker._icon);
		});
	});
});
