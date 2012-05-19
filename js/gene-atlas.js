$(function () {

	var layerInfo = {
		"VZ": { t:"Visum Zipsum" },
		"SZ": { t:"Sisum Zipsum" },
		"IZ": { t:"Isum Zipsum" },
		"SP": { t:"Sisum Pipsum" },
		"LP": { t:"Lisum Pipsum" },
		"UP": { t:"Uisum Pipsum" },
		"MZ": { t:"Misum Zipsum" }
	};

	var ages = [{
			name: 'E15',
			layers: [{
				n: "VZ", s: 1, f: 1
			},{
				n: "SZ", s: 2
			},{
				n: "IZ", s: 4, f: 2
			},{
				n: "SP", s: 1
			},{
				n: "LP", s: 2, b: false
			},{
				n: "UP", s: 2, f: 1
			},{
				n: "MZ", s: 1, b: false
			}]
		}];
		
	$.each(ages, function() {
		$.each(this.layers, function() {
			this.i = layerInfo[this.n].t;
		});
	});
	
	chart = Raphael("graph", 900, 650);
	
	chart_e15 = chart.geneLayers(50, 300, 100, 200, ages[0].layers);

});
