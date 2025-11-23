FROM python:2.7.18-stretch
RUN pip install couchapp==1.0.1
RUN pip install simplejson
RUN pip install couchdbkit

WORKDIR /app/_attachments/data 

RUN python csv2json.py SP-Shortlist.csv -v SP_data -F sc > SP-Shortlist.js
RUN python convert_couch.py

WORKDIR /app

CMD ["couchapp push . http://admin:password@172.18.0.1:5984/dpag-subplate-atlas"]
