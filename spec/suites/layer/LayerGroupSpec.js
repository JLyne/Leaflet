describe('LayerGroup', function () {
	describe("#hasLayer", function () {
		it("throws when called without proper argument", function () {
			var lg = L.layerGroup();
			var hasLayer = L.Util.bind(lg.hasLayer, lg);
			expect(hasLayer).withArgs(new L.Layer()).to.not.throwException(); // control case

			expect(hasLayer).withArgs(undefined).to.throwException();
			expect(hasLayer).withArgs(null).to.throwException();
			expect(hasLayer).withArgs(false).to.throwException();
			expect(hasLayer).to.throwException();
		});
	});

	describe("#addLayer", function () {
		it('adds a layer', function () {
			var lg = L.layerGroup(),
			    marker = L.marker([0, 0]);

			expect(lg.addLayer(marker)).to.eql(lg);

			expect(lg.hasLayer(marker)).to.be(true);
		});
	});

	describe("#removeLayer", function () {
		it('removes a layer', function () {
			var lg = L.layerGroup(),
			    marker = L.marker([0, 0]);

			lg.addLayer(marker);
			expect(lg.removeLayer(marker)).to.eql(lg);

			expect(lg.hasLayer(marker)).to.be(false);
		});
	});

	describe("#clearLayers", function () {
		it('removes all layers', function () {
			var lg = L.layerGroup(),
			    marker = L.marker([0, 0]);

			lg.addLayer(marker);
			expect(lg.clearLayers()).to.eql(lg);

			expect(lg.hasLayer(marker)).to.be(false);
		});
	});

	describe("#getLayers", function () {
		it('gets all layers', function () {
			var lg = L.layerGroup(),
			    marker = L.marker([0, 0]);

			lg.addLayer(marker);

			expect(lg.getLayers()).to.eql([marker]);
		});
	});

	describe("#eachLayer", function () {
		it('iterates over all layers', function () {
			var lg = L.layerGroup(),
			    marker = L.marker([0, 0]),
			    ctx = {foo: 'bar'};

			lg.addLayer(marker);

			lg.eachLayer(function (layer) {
				expect(layer).to.eql(marker);
				expect(this).to.eql(ctx);
			}, ctx);
		});
	});

	describe("#invoke", function () {
		it('should invoke `setOpacity` method on every layer', function () {
			var layers = [
				L.marker([0, 0]),
				L.marker([1, 1])
			];
			var lg = L.layerGroup(layers);
			var opacity = 0.5;

			expect(layers[0].options.opacity).to.not.eql(opacity);
			lg.invoke('setOpacity', opacity);
			expect(layers[0].options.opacity).to.eql(opacity);
			expect(layers[1].options.opacity).to.eql(opacity);
		});
	});
});
