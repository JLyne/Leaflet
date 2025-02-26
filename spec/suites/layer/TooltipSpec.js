describe('Tooltip', function () {
	var container, map,
	    center = [55.8, 37.6];

	beforeEach(function () {
		container = container = createContainer();
		map = L.map(container);
		map.setView(center, 6);
	});

	afterEach(function () {
		removeMapContainer(map, container);
	});

	it("opens on marker mouseover and close on mouseout", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip');

		happen.mouseover(layer._icon, {relatedTarget: map._container});

		expect(map.hasLayer(layer._tooltip)).to.be(true);

		happen.mouseout(layer._icon, {relatedTarget: map._container});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});

	it("opens on marker focus and closes on blur", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip');

		var element = layer.getElement();

		happen.once(element, {type:'focus'});

		expect(map.hasLayer(layer._tooltip)).to.be(true);

		happen.once(element, {type:'blur'});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});

	it("opens on marker focus and closes on blur when first bound, then added to map", function () {
		var layer = L.marker(center);

		layer.bindTooltip('Tooltip').addTo(map);

		var element = layer.getElement();

		happen.once(element, {type:'focus'});

		expect(map.hasLayer(layer._tooltip)).to.be(true);

		happen.once(element, {type:'blur'});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});

	it("opens on marker focus and closes on blur in layer group", function () {
		var marker1 = L.marker([41.18, 9.45], {description: 'Marker 1'});
		var marker2 = L.marker([41.18, 9.46], {description: 'Marker 2'});
		var group = new L.FeatureGroup([marker1, marker2]).addTo(map);
		group.bindTooltip(function (layer) {
			return 'Group tooltip: ' + layer.options.description;
		});

		var element1 = marker1.getElement();
		var element2 = marker2.getElement();

		happen.once(element1, {type:'focus'});

		expect(map.hasLayer(group._tooltip)).to.be(true);
		expect(group._tooltip._container.innerHTML).to.be("Group tooltip: Marker 1");

		happen.once(element1, {type:'blur'});
		expect(map.hasLayer(group._tooltip)).to.be(false);

		happen.once(element2, {type:'focus'});

		expect(map.hasLayer(group._tooltip)).to.be(true);
		expect(group._tooltip._container.innerHTML).to.be("Group tooltip: Marker 2");

		happen.once(element2, {type:'blur'});
		expect(map.hasLayer(group._tooltip)).to.be(false);
	});

	it('opens on marker focus and ignore layers without getElement function', function () {
		var marker1 = L.marker([41.18, 9.45]);
		var someLayerWithoutGetElement = L.layerGroup();
		var group = new L.FeatureGroup([marker1, someLayerWithoutGetElement]).addTo(map);
		group.bindTooltip('Tooltip');
		expect(function () {
			happen.once(marker1.getElement(), {type:'focus'});
		}).to.not.throwException();
	});

	it("is mentioned in aria-describedby of a bound layer", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip');
		var element = layer.getElement();

		happen.once(element, {type:'focus'});

		var tooltip = layer.getTooltip();
		expect(element.getAttribute('aria-describedby')).to.equal(tooltip._container.id);
	});

	it("is mentioned in aria-describedby of a bound layer group", function () {
		var marker1 = L.marker([41.18, 9.45], {description: 'Marker 1'});
		var marker2 = L.marker([41.18, 9.46], {description: 'Marker 2'});
		var group = new L.FeatureGroup([marker1, marker2]).addTo(map);
		group.bindTooltip(function (layer) {
			return 'Group tooltip: ' + layer.options.description;
		});

		var element = marker2.getElement();

		happen.once(element, {type:'focus'});

		var tooltip = group.getTooltip();
		expect(element.getAttribute('aria-describedby')).to.equal(tooltip._container.id);

	});

	it("stays open on marker when permanent", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it("can be added with bindTooltip before added to the map", function () {
		var layer = L.marker(center);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
		layer.addTo(map);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it("is removed when removing marker", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		layer.remove();
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});

	it("is not interactive by default", function () {
		var layer = L.marker(center).addTo(map);
		var spy = sinon.spy();

		layer.bindTooltip('Tooltip', {permanent: true});
		layer._tooltip.on('click', spy);
		happen.click(layer._tooltip._container);
		expect(spy.called).to.be(false);
	});

	it("can be made interactive", function () {
		var layer = L.marker(center).addTo(map);
		var spy = sinon.spy();

		layer.bindTooltip('Tooltip', {permanent: true, interactive: true});
		layer._tooltip.on('click', spy);
		happen.click(layer._tooltip._container);
		expect(spy.calledOnce).to.be(true);
	});

	it("events are propagated to bound layer", function () {
		var layer = L.marker(center).addTo(map);
		var spy = sinon.spy();
		layer.on('click', spy);

		layer.bindTooltip('Tooltip', {permanent: true, interactive: true});
		happen.click(layer._tooltip._container);
		expect(spy.calledOnce).to.be(true);
	});

	it("has class leaflet-interactive", function () {
		var layer = L.marker(center).addTo(map);
		layer.bindTooltip('Tooltip', {permanent: true, interactive: true});
		expect(L.DomUtil.hasClass(layer._tooltip._container, 'leaflet-interactive')).to.be(true);
	});

	it("has not class leaflet-interactive", function () {
		var layer = L.marker(center).addTo(map);
		layer.bindTooltip('Tooltip', {permanent: true});
		expect(L.DomUtil.hasClass(layer._tooltip._container, 'leaflet-interactive')).to.be(false);
	});

	it("can be forced on left direction", function () {
		var layer = L.marker(center).addTo(map);
		var spy = sinon.spy();
		layer.on('click', spy);

		layer.bindTooltip('A long tooltip that should be displayed on the left', {permanent: true, direction: 'left', interactive: true});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		happen.at('click', 150, 180);  // Marker is on the map center, which is 400px large.
		expect(spy.calledOnce).to.be(true);
	});

	it("honours offset on left direction", function () {
		var layer = L.marker(center).addTo(map);
		var spy = sinon.spy();
		layer.on('click', spy);

		layer.bindTooltip('A long tooltip that should be displayed on the left', {permanent: true, direction: 'left', interactive: true, offset: [-20, -20]});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		happen.at('click', 150, 180);
		expect(spy.calledOnce).to.be(false);
		happen.at('click', 130, 160);
		expect(spy.calledOnce).to.be(true);
	});

	it('can be forced on center', () => {
		const layer = L.marker(center).addTo(map);
		const spy = sinon.spy();
		layer.on('click', spy);

		layer.bindTooltip('A tooltip that should be displayed on the center', {permanent: true, direction: 'center', interactive: true});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		happen.at('click', 150, 180);  // Marker is on the map center, which is 400px large.
		expect(spy.calledOnce).to.be(true);
	});

	it("honours opacity option", function () {
		var layer = L.marker(center).addTo(map);
		layer.bindTooltip('Tooltip', {permanent: true, opacity: 0.57});
		expect(layer._tooltip._container.style.opacity).to.eql(0.57);
	});

	it("can change opacity with setOpacity", function () {
		var layer = L.marker(center).addTo(map);
		layer.bindTooltip('Tooltip', {permanent: true});
		expect(layer._tooltip._container.style.opacity).to.eql(0.9);
		layer._tooltip.setOpacity(0.57);
		expect(layer._tooltip._container.style.opacity).to.eql(0.57);
	});

	it("it should use a tooltip with a function as content with a FeatureGroup", function () {
		var marker1 = L.marker([55.8, 37.6], {description: "I'm marker 1."});
		var marker2 = L.marker([54.6, 38.2], {description: "I'm marker 2."});
		var group = L.featureGroup([marker1, marker2]).addTo(map);

		group.bindTooltip(function (layer) {
			return layer.options.description;
		});

		// toggle popup on marker1
		happen.mouseover(marker1._icon, {relatedTarget: map._container});
		expect(map.hasLayer(group._tooltip)).to.be(true);
		expect(group._tooltip._container.innerHTML).to.be("I'm marker 1.");

		// toggle popup on marker2
		happen.mouseover(marker2._icon, {relatedTarget: map._container});
		expect(map.hasLayer(group._tooltip)).to.be(true);
		expect(group._tooltip._container.innerHTML).to.be("I'm marker 2.");
	});

	it("opens on polygon mouseover and close on mouseout", function () {
		var layer = L.polygon([[55.8, 37.6], [55.9, 37.6], [55.8, 37.5]]).addTo(map);

		layer.bindTooltip('Tooltip');

		happen.mouseover(layer._path, {relatedTarget: map._container});

		expect(map.hasLayer(layer._tooltip)).to.be(true);

		happen.mouseout(layer._path, {relatedTarget: map._container});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});

	it("stays open on polygon when permanent", function () {
		var layer = L.polygon([[55.8, 37.6], [55.9, 37.6], [55.8, 37.5]]).addTo(map);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it("can be added on polygon with bindTooltip before beind added to the map", function () {
		var layer = L.polygon([[55.8, 37.6], [55.9, 37.6], [55.8, 37.5]]);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
		layer.addTo(map);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		layer.remove();
		expect(map.hasLayer(layer._tooltip)).to.be(false);
		layer.addTo(map);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it("opens on polyline mouseover and close on mouseout", function () {
		var layer = L.polyline([[55.8, 37.6], [55.9, 37.6], [55.8, 37.5]]).addTo(map);

		layer.bindTooltip('Tooltip');

		happen.mouseover(layer._path, {relatedTarget: map._container});

		expect(map.hasLayer(layer._tooltip)).to.be(true);

		happen.mouseout(layer._path, {relatedTarget: map._container});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});

	it("stays open on polyline when permanent", function () {
		var layer = L.polyline([[55.8, 37.6], [55.9, 37.6], [55.8, 37.5]]).addTo(map);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it("can be added on polyline with bindTooltip before added to the map", function () {
		var layer = L.polyline([[55.8, 37.6], [55.9, 37.6], [55.8, 37.5]]);

		layer.bindTooltip('Tooltip', {permanent: true});
		expect(map.hasLayer(layer._tooltip)).to.be(false);
		layer.addTo(map);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		layer.remove();
		expect(map.hasLayer(layer._tooltip)).to.be(false);
		layer.addTo(map);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it.skipIfNotTouch("is opened when tapping on touch", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip');
		expect(map.hasLayer(layer._tooltip)).to.be(false);
		happen.click(layer._icon);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
	});

	it.skipIfNotTouch("is closed if not permanent when clicking on the map elsewhere on touch", function () {
		var layer = L.marker(center).addTo(map);

		layer.bindTooltip('Tooltip');
		happen.click(layer._icon);
		expect(map.hasLayer(layer._tooltip)).to.be(true);
		happen.click(map._container);
		expect(map.hasLayer(layer._tooltip)).to.be(false);
	});


	it("opens with map.openTooltip", function (done) {
		map.on('tooltipopen', function (e) {
			expect(map.hasLayer(e.tooltip)).to.be(true);
			done();
		});
		map.openTooltip('Tooltip', center);
	});

	it("map.openTooltip considers interactive option", function () {
		var spy = sinon.spy();
		var tooltip = L.tooltip({interactive: true, permanent: true})
		  .setContent('Tooltip')
		  .on('click', spy);
		map.openTooltip(tooltip, center);

		happen.click(tooltip._container);
		expect(spy.calledOnce).to.be(true);
	});

	it("can call closeTooltip while not on the map", function () {
		var layer = L.marker(center);
		layer.bindTooltip('Tooltip', {interactive: true});
		layer.closeTooltip();
	});

	it('opens a tooltip and follow the mouse (sticky)', () => {
		const layer = L.polygon([[58, 39.7], [58, 35.3], [54, 35.3], [54, 39.7]]).addTo(map);
		layer.bindTooltip('Sticky', {sticky: true}).openTooltip();
		var tooltip = layer.getTooltip();
		expect(tooltip.getLatLng().equals(layer.getCenter())).to.be(true);

		happen.at('click', 120, 120);
		var latlng = map.containerPointToLatLng([120, 120]);
		expect(tooltip.getLatLng().equals(latlng)).to.be(true);
	});

	it('opens a permanent tooltip and follow the mouse (sticky)', (done) => {
		const layer = L.polygon([[58, 39.7], [58, 35.3], [54, 35.3], [54, 39.7]]).addTo(map);
		layer.bindTooltip('Sticky', {sticky: true, permanent: true}).openTooltip();
		var tooltip = layer.getTooltip();
		expect(tooltip.getLatLng().equals(layer.getCenter())).to.be(true);

		var hand = new Hand({
			timing: 'fastframe',
			onStop: function () {
				var latlng = map.containerPointToLatLng([120, 120]);
				expect(tooltip.getLatLng().equals(latlng)).to.be(true);
				done();
			}
		});
		var toucher = hand.growFinger('mouse');
		toucher.wait(100).moveTo(120, 120, 1000).wait(100);
	});

	it("closes existent tooltip on new bindTooltip call", function () {
		var layer = L.marker(center).addTo(map);
		var eventSpy = sinon.spy(layer, "unbindTooltip");
		layer.bindTooltip('Tooltip1', {permanent: true});
		var tooltip1 = layer.getTooltip();
		layer.bindTooltip('Tooltip2').openTooltip();
		layer.unbindTooltip.restore(); // unwrap the spy
		expect(map.hasLayer(tooltip1)).to.not.be.ok();
		expect(eventSpy.calledOnce).to.be.ok();
	});

	it("don't opens the tooltip on marker mouseover while dragging map", function () {
		// Sometimes the mouse is moving faster then the map while dragging and then the marker can be hover and
		// the tooltip opened / closed.
		var layer = L.marker(center).addTo(map).bindTooltip('Tooltip');
		var tooltip = layer.getTooltip();

		// simulate map dragging
		map.dragging.moving = function () {
			return true;
		};
		happen.at('mouseover', 210, 195);
		expect(tooltip.isOpen()).to.be(false);

		// simulate map not dragging anymore
		map.dragging.moving = function () {
			return false;
		};
		happen.at('mouseover', 210, 195);
		expect(tooltip.isOpen()).to.be.ok();
	});

	it("closes the tooltip on marker mouseout while dragging map and don't open it again", function () {
		// Sometimes the mouse is moving faster then the map while dragging and then the marker can be hover and
		// the tooltip opened / closed.
		var layer = L.marker(center).addTo(map).bindTooltip('Tooltip');
		var tooltip = layer.getTooltip();

		// open tooltip before "dragging map"
		happen.at('mouseover', 210, 195);
		expect(tooltip.isOpen()).to.be.ok();

		// simulate map dragging
		map.dragging.moving = function () {
			return true;
		};
		happen.mouseout(layer._icon, {relatedTarget: map._container});
		expect(tooltip.isOpen()).to.be(false);

		// tooltip should not open again while dragging
		happen.at('mouseover', 210, 195);
		expect(tooltip.isOpen()).to.be(false);
	});

	it('opens the tooltip if the tooltip is loaded while the map is dragging.', function () {
		// simulate map dragging
		map.dragging.moving = function () {
			return true;
		};

		// If tooltips are dynamically loaded while the map is dragging, they need
		// to be loaded when the dragging stops.
		var layer = L.marker(center).bindTooltip('Tooltip', {permanent: true});
		map.addLayer(layer);

		// simulate map not dragging anymore
		map.dragging.moving = function () {
			return false;
		};

		// Actually triggers both movestart and moveend.
		map.setView([51.505, -0.09], 13);

		// The tooltip is loaded now!
		expect(map.hasLayer(layer._tooltip)).to.be.ok();
		var tooltip = layer.getTooltip();
		expect(tooltip.isOpen()).to.be.ok();
	});

	it("opens tooltip with passed latlng position while initializing", function () {
		var tooltip = new L.Tooltip(center)
			.addTo(map);
		expect(map.hasLayer(tooltip)).to.be(true);
	});

	it("opens tooltip with passed latlng and options position while initializing", function () {
		var tooltip = new L.Tooltip(center, {className: 'testClass'})
			.addTo(map);
		expect(map.hasLayer(tooltip)).to.be(true);
		expect(L.DomUtil.hasClass(tooltip.getElement(), 'testClass')).to.be(true);
	});

	it("adds tooltip with passed content in options while initializing", function () {
		var tooltip = new L.Tooltip(center, {content: 'Test'})
			.addTo(map);
		expect(map.hasLayer(tooltip)).to.be(true);
		expect(tooltip.getContent()).to.be('Test');
	});

	// Related to #8558
	it("references the correct targets in tooltipopen event with multiple markers bound to same tooltip", function () {
		var marker1 = L.marker(center, {testId: 'markerA'});
		var marker2 = L.marker([57.123076977278, 44.861962891635], {testId: 'markerB'});
		map.addLayer(marker1);
		map.addLayer(marker2);

		var tooltip = L.tooltip().setContent('test');

		var layer1 = marker1.bindTooltip(tooltip);
		var layer2 = marker2.bindTooltip(tooltip);

		var spy = sinon.spy();
		var spy2 = sinon.spy();

		layer1.on('tooltipopen', function (e) {
			spy();
			expect(e.target.options.testId).to.eql('markerA');
		});

		layer2.on('tooltipopen', function (e) {
			spy2();
			expect(e.target.options.testId).to.eql('markerB');
		});

		expect(spy.called).to.be(false);
		layer1.openTooltip().closeTooltip();
		expect(spy.called).to.be(true);
		expect(spy2.called).to.be(false);
		layer2.openTooltip();
		expect(spy2.called).to.be(true);
	});
});
