#
#  Quick and dirty data converter
#
from couchdbkit import *
from couchdbkit.loaders import FileSystemDocsLoader
from uuid import uuid4
import datetime
import time
import csv
import os
import pprint

# define the data fields we will keep
class Gene(Document):
  Symbol = StringProperty()
  AltSymbols = StringProperty()
  FullName = StringProperty()
  Function = StringProperty()
  Exp_E14E15 = StringProperty()
  Ptn_E14E15 = IntegerProperty()
  Exp_E18 = StringProperty()
  Ptn_E18 = IntegerProperty()
  Exp_P4P7 = StringProperty()
  Ptn_P4P7 = IntegerProperty()
  Exp_Adult = StringProperty()
  Ptn_Adult = IntegerProperty()
  
def getGenePattern(ptn):
  if ptn == "na":
    return -1
  else:
    return int(ptn)

def getGeneString(s):
  if s == "0":
    return ""
  else:
    return s.strip()
    
def csv_to_couch_dump():
  # read the file
  csvReader = csv.reader(open('SP-Shortlist.csv', 'r'), delimiter=';', quotechar='"')

  # create database
  server = Server("https://dpag.iriscouch.com:6984/")
  db = server.get_or_create_db("dpag-sp-shortlist")
  
  # init the object  
  Gene.set_db(db)

  i = 0
  for col in csvReader:
    #print col
  
    # skip empty data
    if col[0] == "Gene Symbol" or col[0] == "0":
      continue
    
    # save the object
    gene = Gene(
      Symbol =      getGeneString(col[0]),
      AltSymbols =  getGeneString(col[1]),
      Exp_E14E15 =  getGeneString(col[2]),
      Ptn_E14E15 =  getGenePattern(col[3]),
      Exp_E18 =     getGeneString(col[4]),
      Ptn_E18 =     getGenePattern(col[5]),
      Exp_P4P7 =    getGeneString(col[6]),
      Ptn_P4P7 =    getGenePattern(col[7]),
      Exp_Adult =   getGeneString(col[8]),
      Ptn_Adult =   getGenePattern(col[9]),
      FullName =    getGeneString(col[10]),
      Function =    getGeneString(col[11])
    )    
    
    gene.save()
    i = i + 1
    
    if i%100 == 0:
      print "Processed %d rows" % i

    # comment out these two lines to grab all data (30 min on my machine..)
#    if i == 10:
#      break

  print "Processed %d rows" % i

csv_to_couch_dump()

