Data Conversion for Gene Database
=================================

Here's the sample data structure we're working with:

Gene Symbol		Alt Symbols	E14/E15	E18		P4 (P7)	Adult
2600011C06Rik 	Rbm25		na		na		SP:s	SP:w, SZ:s

How to convert:

1. Save the gene worksheet as SP-Shortlist.csv in this folder.
   * in Excel, use Save As... Comma-Separated Values (CSV) file
   
2. Ensure you have Python 2.7 with the SimpleJson module installed.
   * Python can be downloaded here: http://www.python.org/download/releases/2.7.3/
   * install simpletools from here: http://pypi.python.org/pypi/setuptools
   * run: ...Python27/Scripts/easy_install simplejson

3. Run the conversion script to update the JSON file as follows:

   python csv2json.py SP-Shortlist.csv -v SP_data -F sc > SP-Shortlist.json
   
4. Check data/SP-Info.json in case of any changes to the structure.