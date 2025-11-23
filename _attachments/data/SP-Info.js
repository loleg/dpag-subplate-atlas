/* All usable layers must be defined here 
   -------------------------------------- */
var SP_layers = {
	"VZ": { t: "VZ" },
	"SZ": { t: "SZ" },
	"IZ": { t: "IZ" },
	"SP": { t: "SP" },
	"LP": { t: "LP" },
	"CP": { t: "CP" },
	"UP": { t: "UP" },
	"MZ": { t: "MZ" },
	"WM": { t: "White Matter"},
	"L6": { t: "Layer 6"},
	"L5": { t: "Layer 5"},
	"L4": { t: "Layer 4"},
	"L3": { t: "Layer 2/3"}
};

/* Layer definitions per age
   -------------------------
   s: height of layer relative to others
   b: show border with next layer (default: true) */
var SP_ages = [{
		name: 'E14/E15',
		layers: [{
			n: "VZ", s: 1
		},{
			n: "SZ", s: 2
		},{
			n: "IZ", s: 4
		},{
			n: "SP", s: 1
		},{
			n: "LP", s: 2, b: false
		},{
			n: "UP", s: 2
		},{
			n: "MZ", s: 1, b: false
		}]
	},{
		name: 'E18',
		layers: [{
			n: "VZ", s: 1
		},{
			n: "SZ", s: 2
		},{
			n: "IZ", s: 4
		},{
			n: "SP", s: 1
		},{
			n: "L6", s: 3
		},{
			n: "L5", s: 1
			
		},{	n: "CP", s: 3
		
		},{
			n: "MZ", s: 1, b: false
		}]
	},{
		name: 'P4 (P7)',
		layers: [{
			n: "VZ", s: 1
		},{
			n: "WM", s: 6
		},{
			n: "SP", s: 1
		},{
			n: "L6", s: 3
		},{
			n: "L5", s: 3
		},{
			n: "L4", s: 3
		},{
			n: "L3", s: 3
		},{	
			n: "MZ", s: 1, b: false
		}]
	},{
		name: 'Adult',
		layers: [{
			n: "VZ", s: 1
		},{
			n: "WM", s: 6
		},{
			n: "SP", s: 1
		},{
			n: "L6", s: 3
		},{
			n: "L5", s: 3
		},{
			n: "L4", s: 3
		},{
			n: "L3", s: 3
		},{	
			n: "MZ", s: 1, b: false
		}]
	}];
