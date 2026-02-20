from pymongo import MongoClient
import certifi

dbClient = MongoClient('mongodb://127.0.0.1:27017/live_cricket')




print(dbClient)
db = dbClient.get_database()
print(db)
Balances = db['balances']  # collection object
Market = db['markets']
Bet = db['bets']
Match = db['matches']
User = db['users']
BetLock = db['betlocks']
CasinoMatch = db['casinomatches']

#data = CasinoMatch.find_one({"match_id":12})
#print(data)
