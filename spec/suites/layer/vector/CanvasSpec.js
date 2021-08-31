describe('Canvas', () => {
	let container, map, latLngs;

	function p2ll(x, y) {
		return map.layerPointToLatLng([x, y]);
	}

	beforeEach(() => {
		container = createContainer();
		map = L.map(container, {zoomControl: false});
		map.setView([0, 0], 6);
		latLngs = [p2ll(0, 0), p2ll(0, 100), p2ll(100, 100), p2ll(100, 0)];
	});

	afterEach(() => {
		removeMapContainer(map, container);
	});

	describe('#events', () => {
		let layer;

		beforeEach(() => {
			layer = L.polygon(latLngs).addTo(map);
		});

		it('should fire event when layer contains mouse', () => {
			const spy = sinon.spy();
			layer.on('click', spy);
			UIEventSimulator.fireAt('click', 50, 50);  // Click on the layer.
			expect(spy.callCount).to.eql(1);
			UIEventSimulator.fireAt('click', 150, 150);  // Click outside layer.
			expect(spy.callCount).to.eql(1);
		});

		it('DOM events propagate from canvas polygon to map', () => {
			const spy = sinon.spy();
			map.on('click', spy);
			UIEventSimulator.fireAt('click', 50, 50);
			expect(spy.callCount).to.eql(1);
		});

		it('DOM events fired on canvas polygon can be cancelled before being caught by the map', () => {
			const mapSpy = sinon.spy();
			const layerSpy = sinon.spy();
			map.on('click', mapSpy);
			layer.on('click', L.DomEvent.stopPropagation).on('click', layerSpy);
			UIEventSimulator.fireAt('click', 50, 50);
			expect(layerSpy.callCount).to.eql(1);
			expect(mapSpy.callCount).to.eql(0);
		});

		it('DOM events fired on canvas polygon are propagated only once to the map even when two layers contains the event', () => {
			const spy = sinon.spy();
			L.polygon(latLngs).addTo(map); // layer 2
			map.on('click', spy);
			UIEventSimulator.fireAt('click', 50, 50);
			expect(spy.callCount).to.eql(1);
		});

		it('should not block mousemove event going to non-canvas features', () => {
			const spyMap = sinon.spy();
			map.on('mousemove', spyMap);
			UIEventSimulator.fireAt('mousemove', 151, 151); // empty space
			expect(spyMap.calledOnce).to.be.ok();
		});

		it('should fire preclick before click', () => {
			const clickSpy = sinon.spy();
			const preclickSpy = sinon.spy();
			layer.on('click', clickSpy);
			layer.on('preclick', preclickSpy);
			layer.once('preclick', () => {
				expect(clickSpy.called).to.be(false);
			});
			UIEventSimulator.fireAt('click', 50, 50);  // Click on the layer.
			expect(clickSpy.callCount).to.eql(1);
			expect(preclickSpy.callCount).to.eql(1);
			UIEventSimulator.fireAt('click', 150, 150);  // Click outside layer.
			expect(clickSpy.callCount).to.eql(1);
			expect(preclickSpy.callCount).to.eql(1);
		});

		it('should not fire click when dragging the map on top of it', (done) => {
			const downSpy = sinon.spy();
			const clickSpy = sinon.spy();
			const preclickSpy = sinon.spy();
			layer.on('click', clickSpy);
			layer.on('preclick', preclickSpy);
			layer.on('mousedown', downSpy);
			const hand = new Hand({
				timing: 'fastframe',
				onStop() {
					// Prosthetic does not fire a click when we down+up, but it real world
					// browsers would, so let's simulate it.
					UIEventSimulator.fireAt('click', 70, 60);
					expect(downSpy.called).to.be(true);
					expect(clickSpy.called).to.be(false);
					expect(preclickSpy.called).to.be(false);
					done();
				}
			});
			const mouse = hand.growFinger('mouse');

			// We move 5 pixels first to overcome the 3-pixel threshold of
			// L.Draggable.
			mouse.moveTo(50, 50, 0)
				.down().moveBy(20, 10, 200).up();
		});

		it('does fire mousedown on layer after dragging map', (done) => { // #7775
			const spy = sinon.spy();
			const center = p2ll(300, 300);
			const radius = p2ll(200, 200).distanceTo(center);
			const circle = L.circle(center, {radius}).addTo(map);
			circle.on('mousedown', spy);

			const hand = new Hand({
				timing: 'fastframe',
				onStop() {
					expect(spy.callCount).to.eql(2);
					done();
				}
			});
			const mouse = hand.growFinger('mouse');

			mouse.wait(100)
				.moveTo(300, 300, 0).down().moveBy(5, 0, 20).up()  // control case
				.moveTo(100, 100, 0).down().moveBy(5, 0, 20).up()  // drag the map (outside of circle)
				.moveTo(300, 300, 0).down().moveBy(5, 0, 20).up(); // expect mousedown ok
		});
	});

	describe('#events(interactive=false)', () => {
		it('should not fire click when not interactive', () => {
			const layer = L.polygon(latLngs, {interactive: false}).addTo(map);
			const spy = sinon.spy();
			layer.on('click', spy);
			UIEventSimulator.fireAt('click', 50, 50);  // Click on the layer.
			expect(spy.callCount).to.eql(0);
			UIEventSimulator.fireAt('click', 150, 150);  // Click outside layer.
			expect(spy.callCount).to.eql(0);
		});
	});

	describe('#dashArray', () => {
		it('can add polyline with dashArray', () => {
			L.polygon(latLngs, {
				dashArray: '5,5'
			}).addTo(map);
		});

		it('can setStyle with dashArray', () => {
			const layer = L.polygon(latLngs).addTo(map);
			layer.setStyle({
				dashArray: '5,5'
			});
		});
	});

	describe('#bringToBack', () => {
		it('is a no-op for layers not on a map', () => {
			const path = L.polyline([[1, 2], [3, 4], [5, 6]]);
			expect(path.bringToBack()).to.equal(path);
		});

		it('is a no-op for layers no longer in a LayerGroup', () => {
			const group = L.layerGroup().addTo(map);
			const path = L.polyline([[1, 2], [3, 4], [5, 6]]).addTo(group);

			group.clearLayers();

			expect(path.bringToBack()).to.equal(path);
		});
	});

	describe('#bringToFront', () => {
		it('is a no-op for layers not on a map', () => {
			const path = L.polyline([[1, 2], [3, 4], [5, 6]]);
			expect(path.bringToFront()).to.equal(path);
		});

		it('is a no-op for layers no longer in a LayerGroup', () => {
			const group = L.layerGroup().addTo(map);
			const path = L.polyline([[1, 2], [3, 4], [5, 6]]).addTo(group);

			group.clearLayers();

			expect(path.bringToFront()).to.equal(path);
		});
	});

	describe('Canvas #remove', () => {
		it('can remove the map without errors', (done) => {
			L.polygon(latLngs).addTo(map);
			map.remove();
			map = null;
			L.Util.requestAnimFrame(() => { done(); });
		});

		it('can remove renderer without errors', (done) => {
			map.remove();

			const canvas = L.canvas();
			map = L.map(container, {renderer: canvas});
			map.setView([0, 0], 6);
			L.polygon(latLngs).addTo(map);

			canvas.remove();
			map.remove();
			map = null;
			L.Util.requestAnimFrame(() => { done(); });
		});
	});
});
