/* (C) Oleg Lavrovsky 2012 */
$(function() { 

// Chart configuration
var width = 600, height = 320;
var chart = null;
var lastGeneSymbol = null, lastGenePattern = null;

// Setup db access
var path = unescape(document.location.pathname).split('/'),
    $design = path[3],
    $db = $.couch.db(path[1]);
    
// Load gene database
$db.view($design + "/all-genes", {
    descending: false,
    limit: 500,
    reduce: false,
    success: initGeneAtlas
});

/* ***** UTILITY FUNCTIONS ***** */

// When any go links/buttons are clicked
function clickGo() {
	// get link target
	var tgt = $(this).attr('href').replace('#','');
	// handle queries
	if ($(this).hasClass('query') && lastGeneSymbol != null) {
		switch(tgt) {
		case 'genes':
			$('#gene-searchbox').val(lastGeneSymbol).trigger('keyup');
			break;
		case 'patterns':
			$.each(lastGenePattern, function(n) {
				$('.patterns section[age="' + n + '"] select').val(parseInt(this));
			});
			$('.patterns section select:last').trigger('change');
			break;
		}	
	}
	// swap page
	navigateTo(tgt);
}

// Load a specific section of the page
function navigateTo(tgt, showMenu) {
	$('article').addClass('hidden');
	$('article.' + tgt).removeClass('hidden');
	if (typeof showMenu == 'undefined' || showMenu) {
		$('nav a').removeClass('current');
		$('nav a[href="#' + tgt + '"]').addClass('current');
	}
	switch(tgt) {
	case 'home': break;
	case 'genes':
		$('#gene-searchbox').focus();
		break;
	case 'patterns': break;
	case 'about': break;
	default:
		return locateGene(tgt);
	}
	$(document).scrollTop(0);
}

// Open full details on a gene
function loadGeneDetails(id) {
	$db.openDoc(id, {
        success: loadGeneSimilar
    });
}

// Appropriate similar genes are loaded
function loadGeneSimilar(doc) {
	var sq =
	 [doc.Ptn_Adult,
	  doc.Ptn_E14E15,
	  doc.Ptn_E18,
	  doc.Ptn_P4P7];
    $db.view($design + "/similar-genes", {
        descending: false,
        limit: 50,
        reduce: false,
        startkey: sq,
        endkey: sq,
        success: 
        	function(data) {
        		doc.similar = [];
        		$.each(data.rows, function() {
        			if (doc.id == this.id) return;
        			doc.similar.push({
        				id: this.id,
        				name: this.value
        			});
        		});
        		showGeneDetail(doc);
        	}
    });
}

// Set up the gene search
function initGeneAtlas(data) {

	var SP_data = data.rows.map(function(r) {return [r.key, r.id];});

	// Load genes
	var geneList = $(".genes .gene-list ul"), geneArray = [];
	$.each(SP_data, function(i) {
		geneList.append('<li index="' + i + '" id="' + this[1] + '">' + this[0] + '</li>');
		geneArray.push(this[0].toLowerCase());
	});

	// Keyword search field
	$("#gene-searchbox").keyup(function() {
		if (this.value.length < 1) {
			$("li", geneList).show();
			$(".gene-reset").css({ visibility:'hidden' });
			return;
		}
		$(".gene-reset").css({ visibility:'visible' });
		var searchTerm = $.trim(this.value).toLowerCase(),
			objs = $("li", geneList).hide().parent();
		for (var i = 0; i < geneArray.length; i++) {
			if (geneArray[i].indexOf(searchTerm) != -1) {
				$("li[index='" + i + "']", objs).show();
			}
		}
	}).keydown(function(event) {
		if (event.keyCode == '13') {
			var visGenes = $("li", geneList).filter(":visible");
			if (visGenes.length == 1) {
				visGenes.find('a').click();
			}
			event.preventDefault(); 
		}
	});
	$(".gene-reset").click(function() { 
		$("#gene-searchbox").val('').trigger('keyup');
	});
	
	// Setup page links
	$('button').button();
	$('.go').click(clickGo);

	// Initial gene list
	setupGeneList(".genes .gene-list li");

	// Load gene pattern lists
	$('.patterns .fourcolumns section').append($('#gene-pattern-select').html());
	$('.patterns select').change(selectPatterns);
	
	// Navigate to link
	if (document.location.hash) {
		navigateTo(document.location.hash.replace('#',''));
	}
}

// Creates links from a list of genes
function setupGeneList(obj) {
	$(obj).wrapInner('<a href="#"></a>').each(function() {
		$('a', this)
			.attr("href", "#" + $(this).text())
			.click(locateGene);
	});
}

// Gene link
function locateGene(name) {
	var geneId = null;
	if (typeof name == "string") {
		geneId = $(".gene-list li:contains('" + name + "')").attr('id');
	} else {
		geneId = $(this).parent().attr('id');
	}
	if (typeof geneId != 'undefined' && geneId != null) {
		// TODO: local cache
		loadGeneDetails(geneId);
	}
}

// Open detail page on a gene
function showGeneDetail(data) {

	navigateTo('gene-result', false);
	//console.log(data);
	/*
	Example data structure:
	-----------------------
		AltSymbols: "Rbm25"
		Exp_Adult: "SP:s, L5:s, L6:s-, L4:s-, L3:s-, MZ:s-"
		Exp_E14E15: "na"
		Exp_E18: "na"
		Exp_P4P7: "na"
		FullName: "RNA binding motif protein 25"
		Function: ""
		Ptn_Adult: 2
		Ptn_E14E15: -1
		Ptn_E18: -1
		Ptn_P4P7: -1
		Symbol: "2600011C06Rik"
	*/
	
	// Save query links
	lastGeneSymbol = data.Symbol;
	lastGenePattern = {
		Ptn_Adult: 	data['Ptn_Adult'],
		Ptn_E14E15: data['Ptn_E14E15'],
		Ptn_E18: 	data['Ptn_E18'],
		Ptn_P4P7: 	data['Ptn_P4P7']
	};
	var geneSimilar = (data.similar.length > 1) ? data.similar : false;
	
	// Add details to page
	$('.gene-result section').html(
		$.mustache($("#gene-details").html(), {
			symbol:		data.Symbol,
			title:		data.FullName,
			alts:		data.AltSymbols,
			functions:	data['Function'],
			similar:	geneSimilar
		}));

	// Back buttons
	$('button.go.back').attr('href', $('nav .current').attr('href'));

	// Setup similar links
	setupGeneList(".gene-result .gene-list li");

	// Render gene image
	chart = Raphael("gene-graph", width, height);
	renderGene([data.Exp_E14E15, data.Exp_E18, data.Exp_P4P7, data.Exp_Adult]);
	
}

// Sets up gene visualization
function renderGene(gene) {

	// Get snapshot of current layer configuration
	var geneChart = [],
		geneAges = jQuery.extend(true, {}, SP_ages);
	
	// Clear the chart
	chart.clear();
	
	// Iterate through the four ages
	$.each(geneAges, function(index) { 
	
		// Parse age levels
		if (typeof gene == 'undefined') {
			alert('Gene undefined in renderGene'); return;
		}
		if (typeof gene[index] == 'undefined') {
			alert('Gene missing definition for ' + this.name); return;
		}
		var gdls = getLevelsForGene(gene[index]);
		if (gdls.blank) { this.layers.x_blank = true; }
		else if (gdls.na) { this.layers.x_notapplicable = true; }
	
		// Add layer info
		$.each(this.layers, function() {
			if (typeof SP_layers[this.n] == 'undefined') {
				alert("Layer " + this.n + " missing definition"); return;
			}
			// Info text for this layer
			this.i = SP_layers[this.n].t;
			// Fill level, if not empty
			if (gdls) {
				if (typeof gdls.ALL != 'undefined') {
					this.f = getGeneFillLevel(gdls.ALL);
				} else {
					this.f = getGeneFillLevel(gdls[this.n]);
				}
				if (this.f > 0) {
					this.i = gdls[this.n] + " " + this.i;
				}
			}
		});
							 
		// Create chart for this age
		geneChart.push(
			// cx, cy, w, layerHeight
			chart.geneLayers(parseInt(index * width / 4.4) + 1, 
							 parseInt(height * 0.9), 
							 parseInt(width / 6), 
							 parseInt(height / 24), 
							 this.layers, this.name)
		);

	});

}

function selectPatterns() {

	var patternFilter = [], endFilter = [], whichQuery = 0;
	var patternOrder = 
		[ 'Ptn_Adult', 'Ptn_E14E15', 'Ptn_E18', 'Ptn_P4P7' ];
	var patternQueries = 
		[ 'similar-genes', 'genes-by-e14', 'genes-by-e18', 'genes-by-p4' ];	
	var postFilter = false, debugFilter = [];
	
	// Collect pattern selection
	$.each(patternOrder, function() {
		var i = $('.patterns section[age="' + this + '"] select').val();
		if (i == "") {
			if (patternFilter.length == 0) {
				whichQuery++;
			} else {
				postFilter = true;
				patternFilter.push(null);
				endFilter.push({});
				debugFilter.push(this);
			}
		} else {
			patternFilter.push(parseInt(i));
			endFilter.push(parseInt(i));
			debugFilter.push(this);
		}
	});
	if (whichQuery >= patternQueries.length) whichQuery = 0;
	
	// DEBUG
	if (typeof console != 'undefined') {
		console.log(debugFilter.toString());
		console.log(patternQueries[whichQuery] + ' ' + 
			patternFilter.toString() + ' -> ' + 
			endFilter.toString());
	}
	
	// No patterns selected
	if (patternFilter.length == 0) {
		$('section.pattern-result').html();
		return;
	}
	
    $db.view($design + "/" + patternQueries[whichQuery], {
        descending: false,
        reduce: false,
        startkey: patternFilter,
        endkey: endFilter,
        success: 
        	function(doc) {
        		doc.geneList = [];
        		$.each(doc.rows, function() {
        			if (postFilter) {
        				// Validate this gene
						for (var u in patternFilter) {
							if (patternFilter[u] != null && 
								patternFilter[u] != this.key[u]) 
									return;
						}
        			}
        			doc.geneList.push({
        				id: this.id,
        				name: this.value
        			});
        		});
        		showGenePatterns(doc);
        	}
    });
}

function showGenePatterns(doc) {
	if (doc.geneList.length >= 100) {
		$('section.pattern-result').html(
			'<h4>Too many genes meet this criteria, please narrow down your selection</h4>'
		);
		return;
	} else if (doc.geneList.length == 0) {
		$('section.pattern-result').html(
			'<h4>No genes in the shortlist meet this criteria</h4>'
		);
		return;
	}
	
	// Load and setup gene list
	$('section.pattern-result').html(
		$.mustache($("#gene-patterns-list").html(), {
			genes: doc.geneList,
			geneLength: doc.geneList.length
		})
	);
	setupGeneList(".pattern-result .gene-list li");
}

});
