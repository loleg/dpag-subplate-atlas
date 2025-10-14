FROM python:2.7.18-stretch
RUN pip install couchapp
RUN pip install simplejson
WORKDIR /app
RUN cd _attachments/data 
RUN python csv2json.py SP-Shortlist.csv -v SP_data -F sc > SP-Shortlist.json

CMD ["couchapp push . http://admin:password@172.18.0.1:5984/dpag-subplate-atlas"]
