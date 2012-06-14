function(doc) {
	emit(doc.Symbol, doc.FullName + ' ' + doc.AltSymbols);
}
