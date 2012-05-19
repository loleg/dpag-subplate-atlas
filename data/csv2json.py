#!/usr/local/bin/python
"""
A simple script for generating JSON/JavaScript from comma-separated (or
otherwise delimited) values.

by Shawn Allen <shawn at stamen dot com>

16.3.2012 @loleg - Added UTF-8 support, error handling
"""
import csv, simplejson, unicodedata
from StringIO import StringIO

# These are shorthands for delimiters that might be a pain to type or escape.
delimiter_map = {'tab': '\t',
                 'sc':  ';',
                 'bar': '|'}

# Via http://stackoverflow.com/questions/5004687/python-csv-dictreader-with-utf-8-data
def UnicodeDictReader(utf8_data, **kwargs):
    csv_reader = csv.DictReader(utf8_data, **kwargs)
    for row in csv_reader:
        try:
            yield dict([(key, unicode(str(value), 'utf-8')) for key, value in row.iteritems()])
        except Exception as inst:
            raise Exception('Invalid row', row)

def csv2json(csv_file, delimiter=',', quotechar='"', indent=None, callback=None, variable=None, **csv_opts):
    if delimiter_map.has_key(delimiter):
        delimiter = delimiter_map.get(delimiter)
    reader = UnicodeDictReader(csv_file, delimiter=delimiter, quotechar=quotechar or None, **csv_opts)
    rows = [row for row in reader]
    if hasattr(indent, 'isdigit') and indent.isdigit():
        indent = ' ' * int(indent)
    out = StringIO()
    if callback:
        out.write('%s(' % callback);
    elif variable:
        out.write('var %s = ' % variable)
    simplejson.dump(rows, out, indent=indent, encoding='utf-8')
    if callback:
        out.write(');');
    elif variable:
        out.write(';')
    return out.getvalue()

if __name__ == '__main__':
    import sys
    from optparse import OptionParser

    parser = OptionParser()
    parser.add_option('-F', '--field-separator', dest='fs', default=',',
                      help='The CSV file field separator, default: %default')
    parser.add_option('-q', '--field-quote', dest='fq', default='"',
                      help='The CSV file field quote character, default: %default')
    parser.add_option('-i', '--indent', dest='indent', default=None,
                      help='The string with which to indent the output GeoJSON, '
                           'defaults to none.')
    parser.add_option('-p', '--callback', dest='callback', default=None,
                      help='The JSON-P callback function name.')
    parser.add_option('-v', '--variable', dest='var', default=None,
                      help='If provided, the output becomes a JavaScript statement'
                      ' which assigns the JSON structure to a variable of the same'
                      ' name.')
    options, args = parser.parse_args()

    close = False
    if len(args) > 0 and args[0] != '-':
        csv_file = open(args.pop(0), 'rU')
        close = True
        #options.var = re.match(r"^.*\.json$", args[0])
    else:
        csv_file = sys.stdin
    print csv2json(csv_file, options.fs, options.fq, options.indent, options.callback, options.var)
    if close:
        csv_file.close()