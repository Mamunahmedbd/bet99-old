import json
import requests
from bson import ObjectId, Decimal128
from config.db import Bet, Match, Market, Balances, User, BetLock, CasinoMatch
from typing import Any, Dict, List
from enum import Enum
import asyncio
from datetime import datetime
import traceback
from decimal import Decimal
from flask import jsonify
from datetime import datetime


superNodeUrl = "https://api.driveexch.com/api/"
casinoNodeUrl = "https://api.driveexch.com/api/"
defaultRatio: any = {
    "ownRatio": 100,
    "allRatio": [
        {
            "parent": ObjectId('63382d9bfbb3a573110c1ba5'),
            "ratio": 100,
        },
    ],
}
default_settings: any = {"minBet": 100, "maxBet": 100, "delay": 0}


class JSONEncoderWithObjectId(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, Decimal128):
            return str(o)
        if isinstance(o, datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


def error(obj, message=''):
    return {
        "message": message,
        "code": 401,
        "error": True,
        "data": {},
    }


def delay(ms: int):
    asyncio.sleep(ms / 1000)


BetOn: any = {"FANCY": 'FANCY', 'MATCH_ODDS': 'MATCH_ODDS',
              'CASINO': 'CASINO', 'CASINOFANCY': 'CASINOFANCY'}
# class BetOn(Enum):
#     FANCY = 'FANCY'
#     MATCH_ODDS = 'MATCH_ODDS'
#     CASINO = 'CASINO'
#     CASINOFANCY = 'CASINOFANCY'


def get_user_info(user_id):
    return User.find_one({"_id": ObjectId(user_id)})


def get_user_balance(user_id):
    return Balances.find_one({"userId": user_id})



def validate_bet(payload, userInfo, balance, settings, matchInfo):
    #print(matchInfo)
    if payload['betOn'] == "CASINO" and matchInfo.get("status", 0) == 0:
        return {"message": 'failed', "notification": f"Match Not In Play"}
    if payload['betOn'] != "CASINO" and matchInfo.get("active", "") == 0:
        return {"message": 'failed', "notification": f"Match Not In Play"}

    betLock = BetLock.find_one({
        "matchId": int(payload['matchId']),
        "userId": {"$exists": False}
    })
    betLockUser = BetLock.find_one({
        "matchId": int(payload['matchId']),
        "userId": ObjectId(userInfo['_id']),
    })

    print(betLock)
    print("betLock manish")
    if int(payload['odds']) > 10 and payload['marketName']=='Match Odds':
        return {"message": 'failed', "notification": f"{payload['odds']} is not valid."}
    if int(payload['stack']) >= 99999999:
        return {"message": 'failed', "notification": f"{payload['stack']} is not valid."}
    #if balance and balance['balance'] <= int(payload['stack']):
        #return {"message": 'failed', "notification": f"Low Balance."}
    if not userInfo or (userInfo and userInfo['betLock'] is False):
        return {"message": 'failed', "notification": f"Bet is not acceptable.Please contact upline"}
    if (betLock and betLock['betFair'] and payload['marketName'] == 'Match Odds') or (betLockUser and betLockUser['betFair'] and payload['marketName'] == 'Match Odds'):
        return {"message": 'failed', "notification": f"Bet is not acceptable.Please contact upline"}
    if (betLock and 'book' in betLock and betLock['book'] and payload['marketName'] == 'Bookmaker') or (betLockUser and 'book' in betLockUser and betLockUser['book'] and payload['marketName'] == 'Bookmaker'):
        return {"message": 'failed', "notification": f"Bet is not acceptable.Please contact upline"}
    if (betLock and 'fancy' in betLock and 'fancy' in betLock and betLock['fancy'] and payload['marketName'] == 'Fancy') or (betLockUser and 'fancy' in betLockUser and betLockUser['fancy'] and payload['marketName'] == 'Fancy'):
        return {"message": 'failed', "notification": f"Bet is not acceptable.Please contact upline"}
    #print(settings)
    if (settings and int(settings['minBet']) > payload['stack'] or settings and int(settings['maxBet']) < payload['stack']):
        return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}

    # inplay condition for check max min limmit
    if payload['betOn'] != "CASINO":
        current_datetime = datetime.now()
        match_datetime_str = str(matchInfo['matchDateTime'])
        match_datetime = datetime.strptime(
            match_datetime_str, '%Y-%m-%d %H:%M:%S')
        # print(current_datetime < match_datetime)
        if payload['marketName'] == "Match Odds" and current_datetime < match_datetime:
            return {"message": 'failed', "notification": f"Match is not in play"}
        if (current_datetime < match_datetime):
            # print("The match is in the future.")
            # inplay condition for check max min limmit
            if (payload['betOn'] == "FANCY" and matchInfo and matchInfo['offPlayFancyMinLimit'] > payload['stack'] or matchInfo and payload['betOn'] == "FANCY" and matchInfo['offPlayFancyMaxLimit'] < payload['stack']):
                return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}
            if (payload['marketName'] == "Bookmaker" and matchInfo and matchInfo['offPlayBookMinLimit'] > payload['stack'] or payload['marketName'] == "Bookmaker" and matchInfo and matchInfo['offPlayBookMaxLimit'] < payload['stack']):
                return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}
            if (payload['betOn'] == "MATCH_ODDS" and payload['marketName'] != "Bookmaker" and matchInfo and matchInfo['offPlayMinLimit'] > payload['stack'] or payload['betOn'] == "MATCH_ODDS" and payload['marketName'] != "Bookmaker" and matchInfo and matchInfo['offPlayMaxLimit'] < payload['stack']):
                return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}
        else:
            # print("The match is in the LIVE.")
            # print(matchInfo['inPlayFancyMinLimit'])
            if payload['betOn'] == "FANCY":
                if matchInfo and matchInfo['inPlayFancyMinLimit'] > payload['stack'] or matchInfo and matchInfo['inPlayFancyMaxLimit'] < payload['stack']:
                    return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}
            if payload['marketName'] == "Bookmaker":
                if matchInfo and matchInfo['inPlayBookMinLimit'] > payload['stack'] or matchInfo and matchInfo['inPlayBookMaxLimit'] < payload['stack']:
                    return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}            
            elif payload['betOn'] == "MATCH_ODDS" and payload['marketName'] != "Bookmaker":
                if matchInfo and matchInfo['inPlayMinLimit'] > payload['stack'] or matchInfo and matchInfo['inPlayMaxLimit'] < payload['stack']:
                    return {"message": 'failed', "notification": f"Check Maximum or Minimum Bet Limit"}


def checkAllOddsConditon(payload):
    if ('gtype' in payload and payload['gtype']=='worlimatka' or 'gtype' in payload and payload['gtype']=='worliinstant'):
        return {}
    if (payload['marketName'] != 'Fancy' and payload['betOn'] != BetOn['CASINO']): 
        errors = checkMarketOddsConditions(payload['marketId'], payload['marketName'],
                                           payload['selectionId'], payload['isBack'], payload['odds'], payload['selectionName'])
        #print(errors)
        if (errors):
            return {"message": "failed", "notification": f"{errors}"}
    elif (payload['betOn'] == BetOn['CASINO']):
        errors = checkCasinoOddsConditions(
            payload['gtype'], payload['selectionId'], payload['isBack'], payload['odds'], payload['stack'])
        if (errors):
            return {"message": "failed", "notification": f"{errors}"}
    else:
        errors = checkFancyOddsConditions(
            payload['matchId'], payload['selectionId'], payload['isBack'], payload['odds'], payload['selectionName'])
        if (errors):
            return {"message": "failed", "notification": f"{errors}"}


def GetMatchInfo(payload):
    return CasinoMatch.find_one({"match_id": int(payload['matchId'])}) if payload['betOn'] == "CASINO" else Match.find_one({"matchId": int(payload['matchId'])})


def getMarketRunner(payload, matchInfo):
    if payload['betOn'] == "CASINO":
        marketRunnerFinder = next(
            (market for market in matchInfo["event_data"]["market"] if market["MarketName"] == payload['marketName']), {})
        return marketRunnerFinder.get("Runners", [])
    else:
        market_current_bet = Market.find_one(
            {"marketId": str(payload['marketId']), "matchId": int(payload['matchId'])})
        if market_current_bet:
            return market_current_bet.get("runners", [])
        else:
            return []


def placebet(betObj, userInfo):
    payload = json.loads(betObj)
    # print(payload)
    # print('###')
    try:
        if "stack" in payload:
            # payload['user_id'] = "651d8aea8a1b370947ee2c07"
            parentinfo = get_user_info(userInfo['parentId'])
            matchInfo = GetMatchInfo(payload)
            #print(userInfo)
            # print("matchInfo")
            event_id = payload['eventId']
            bet_On = payload['betOn']
            #print(parentinfo)
            # Initialize the usersetting variable with None or appropriate default value
            if userInfo is not None and 'userSetting' in userInfo and userInfo['userSetting']:
                settings = userInfo['userSetting'][str(
                    matchInfo['sportId'])] if bet_On != 'CASINO' else userInfo['userSetting']['4']
            elif parentinfo is not None and 'userSetting' in parentinfo and parentinfo['userSetting']:
                print('parent setting')
                settings = parentinfo['userSetting'][str(
                    matchInfo['sportId'])] if bet_On != 'CASINO' else parentinfo['userSetting']['4']
            else:
                print('default setting')
                settings = default_settings
            parentNameStr = parentinfo['username']
            # Initialize the partnership variable with None or appropriate default value
            partnership = None

            if parentinfo is not None and 'partnership' in parentinfo and parentinfo['partnership'] is not None:
                if bet_On != BetOn['CASINO']:
                    partnership = parentinfo['partnership'].get(
                        str(event_id), defaultRatio)
                elif bet_On == BetOn['CASINO']:
                    partnership = parentinfo['partnership'].get(
                        str(4), defaultRatio)
            current_datetime = datetime.now()
            # print(event_id)
            # print(partnership)
            # return json.dumps(error({}, "Insufficient Balance"), cls=JSONEncoderWithObjectId)
            

            betClickTime = datetime.now()
            balance = get_user_balance(userInfo['_id'])
            # print(balance)
            divdOdds = float(payload['odds']) if payload['odds']>100 else (float(payload['odds']) + 100)
            stake = payload['stack']
            profit = float(payload['pnl'])
            #odds = (divdOdds/100) if payload['marketName']=='Bookmaker' and bet_On != BetOn['CASINO'] else float(payload['odds'])
            odds = float(payload['odds'])
            match_id = int(payload['matchId'])
            market_id = payload['marketId']
            market_name = payload['marketName']
            loss = float(payload['exposure'])
            selectionName = payload['selectionName']
            selectionId = payload['selectionId']
            isBack = payload['isBack']
            oppsiteVol = payload['oppsiteVol'] if 'oppsiteVol' in payload else "undefined"


            if(market_name=='Match Odds'):
                delay(4000)
            
            if match_id in [23, 15] and int(selectionId) in [11, 12, 13, 14]:
                loss = float(payload['exposure']) * 5
            if match_id in [9]:
                if isBack is False: 
                   loss = -payload['stack'] * (odds/100)
            print(loss)
            print("losslosslossloss")
            ipAddress = payload['ipAddress']
            volume = float(payload.get("volume", 0))
            matchName = payload['matchName']
            validationStatus = validate_bet(
                payload, userInfo, balance, settings, matchInfo)
            #print(validationStatus)
            #print("validationStatus")
            if validationStatus is not None and 'message' in validationStatus:
                notification = validationStatus['notification']
                return json.dumps(error({}, notification), cls=JSONEncoderWithObjectId)
            validateOdds = checkAllOddsConditon(payload)
            #print(validateOdds)
            #print("validateOdds")
            if validateOdds is not None and 'message' in validateOdds:
                notification = validateOdds['notification']
                return json.dumps(error({}, notification), cls=JSONEncoderWithObjectId)
            #print("validateOddsnew")
            # matchName = matchInfo.get("title", "") if payload['betOn'] == "CASINO" else matchInfo.get("name", "")
            runners = getMarketRunner(payload, matchInfo)
            jsonObj = {
                "sportId": event_id if bet_On != 'CASINO' else 5000,
                "userId": ObjectId(userInfo['_id']),
                "userName": userInfo.get("username", ""),
                "betClickTime": datetime.now(),
                "matchId": int(match_id),
                "marketId": market_id,
                "selectionId": int(selectionId),
                "selectionName": selectionName,
                "matchName": matchName,
                "odds": odds,
                "volume": payload.get("volume", 0),
                "stack": stake,
                "pnl": profit,
                "marketName": market_name,
                "isBack": isBack,
                "matchedDate": datetime.now(),
                "matchedOdds": odds,
                "matchedInfo": "",
                "userIp": ipAddress,
                "loss": loss,
                "parentStr": userInfo.get("parentStr", ""),
                "ratioStr": partnership,
                "bet_on": BetOn['FANCY'] if market_name == "Fancy" else bet_On if bet_On == BetOn['CASINO'] else BetOn['MATCH_ODDS'],
                "runners": runners,
                "gtype": payload.get("gtype", "") if payload.get("gtype") and volume >= 100000 or bet_On == BetOn['CASINO'] else "",
                "C1": payload.get("C1", ""),
                "C2": payload.get("C2", ""),
                "C3": payload.get("C3", ""),
                "fancystatus": payload.get("fancystatus", ""),
                "status": "pending",
                "createdAt": current_datetime,
                "updatedAt": current_datetime,
                "parentNameStr": parentNameStr,
                "oppsiteVol" : oppsiteVol

            }
            #print(jsonObj)
            #print("runnersrunnersrunnersrunners")
            if (bet_On != BetOn['CASINO']):
                exposer = getexposerfunction(userInfo, False, jsonObj)
                print("exposer")
                print(exposer)
                if (exposer != 'failed'):
                    available_balance = round(balance.get("balance", 0))
                    casinoexposer = balance.get("casinoexposer", 0)
                    print(available_balance)
                    print((float(exposer) + float(casinoexposer)))
                    if (available_balance < (float(exposer) + float(casinoexposer))):
                        data_to_serialize_ = {"message": "Max limit Exceed"}
                        json_data = json.dumps(
                        data_to_serialize_, cls=JSONEncoderWithObjectId)
                        return json_data
                    betInsert = Bet.insert_one(jsonObj)
                    inserted_id = betInsert.inserted_id
                    inserted_document = Bet.find_one({"_id": inserted_id})
                    # inserted_document_dict = dict(inserted_document)
                    # inserted_document_json = json.dumps(inserted_document_dict)
                    # print(inserted_document_dict)
                    Balances.update_one({"userId": userInfo['_id']}, {
                                        "$set": {"exposer": exposer}})
                    betList = list(Bet.find({
                        "userId": ObjectId(userInfo['_id']),
                        "matchId": int(match_id),
                        "status": 'pending',
                    }))

                    markets = Market.find({"matchId": match_id})
                    profitlist = get_odds_profit(betList, markets)
                    ex = exposer + + balance.get("casinoexposer", 0)
                    data_to_serialize = {
                        "message": "Place Bet Successfully",
                        "error": False,
                        "code": 200,
                        "bet": inserted_document,
                        "bets": betList,
                        "exposer": ex,
                        "profitlist": profitlist,
                    }
                    json_data = json.dumps(
                        data_to_serialize, cls=JSONEncoderWithObjectId)
                    return json_data
                else:
                    print("llllll")
                    return json.dumps(error({}, "Insufficient Balance"), cls=JSONEncoderWithObjectId)
            else:
                casinoexposer = get_casino_exposer(userInfo, False, jsonObj)
                #print(casinoexposer)
                #print("casinoexposer")
                if casinoexposer != 'failed':
                    exposer = balance.get("exposer", 0)
                    available_balance = balance.get("balance", 0)
                    if (available_balance < (float(exposer) + float(casinoexposer))):
                        return json.dumps(error({}, "Max limit Exceed"), cls=JSONEncoderWithObjectId)
                    betInsert = Bet.insert_one(jsonObj)
                    inserted_id = betInsert.inserted_id
                    inserted_document = Bet.find_one({"_id": inserted_id})
                    # inserted_document_dict = dict(inserted_document)
                    # inserted_document_json = json.dumps(inserted_document_dict)
                    # print(inserted_document_dict)
                    Balances.update_one({"userId": userInfo['_id']}, {
                                        "$set": {"casinoexposer": casinoexposer}})
                    betList = list(Bet.find({
                        "userId": ObjectId(userInfo['_id']),
                        "matchId": int(match_id),
                        "status": 'pending',
                        "bet_on": BetOn['CASINO'],
                    }))
                    if matchInfo['status'] == 0:
                        return error({}, "Match Is Not In Play")

                    markets = matchInfo
                    market = None
                    if markets is not None and 'event_data' in markets and markets['event_data'] is not None and 'market' in markets['event_data']:
                        market = markets['event_data']['market']
                        profitlist = get_casino_odds_profit(
                            betList, market, markets)
                        ex = casinoexposer + + balance.get("exposer", 0)
                        data_to_serialize = {
                            "message": "Place Bet Successfully",
                            "error": False,
                            "code": 200,
                            "bet": inserted_document,
                            "bets": betList,
                            "exposer": ex,
                            "profitlist": profitlist,
                        }
                        # print(data_to_serialize)
                        json_data = json.dumps(
                            data_to_serialize, cls=JSONEncoderWithObjectId)
                        return json_data
                else:
                    print("Some trouble")
                    return error({}, "Exposer Issue")
        else:
            return error({}, "Invalid Data")
    except Exception as e:
        print(str(traceback.format_exc()), "error")
        print("expect error")
        return error({}, "Invalid Data")


# Check Current Fancy Odds
def getcurrentfancyodds(market_id, selection_id):
    url = f"{superNodeUrl}get-single-session?MatchID={market_id}&SelectionId={selection_id}"
    print(url)
    response = requests.get(url)
    if response.status_code == 200:
        # API call was successful
        data = response.json()  # Parsing JSON response
        # print("API Response:", data)
        return data
    else:
        # API call failed
        print("Error:", response.status_code)
        # print(response.text)
        userNew = {"message": "failed"}
        return error({}, "Invalid Api Response")

# Check Current Casino Odds https://casino.drsgames.io/api/get-single-market/AAA/1/get-single-market/:type/:selectionid


def getcurrentCasinoodds(game_code, selection_id):
    url = f"{casinoNodeUrl}get-single-market/{game_code}/{selection_id}"
    print(url)
    response = requests.get(url)
    if response.status_code == 200 or response.status_code == 201:
        # API call was successful
        data = response.json()  # Parsing JSON response
        # print("API Response:", data)
        return data
    else:
        # API call failed
        # print("Error:", response.status_code)
        # print(response.text)
        return error({}, "Invalid Api Response")

# Check MATCH ODDS OR BOOKMAKER ODDS


def getcurrentodds(market_id, type):
    url = f"{superNodeUrl}get-odds-single?marketId={market_id}"
    print(url)
    response = requests.get(url)
    if response.status_code == 200:
        # API call was successful
        data = response.json()  # Parsing JSON response
        # print("API Response:", data)
        return data
    else:
        # API call failed
        # print("Error:", response.status_code)
        # print(response.text)
        return error({}, "Invalid Api Response")


def checkMarketOddsConditions(market_id, market_name, selection_id, is_back, odds, selection_name):
    current_odds = getcurrentodds(market_id, market_name)
    print(current_odds)
    print("current_odds")
    if not current_odds or ('sports' not in current_odds) or (current_odds.get('sports') is not None and len(current_odds['sports']) <= 0):
        return 'Bet is not acceptable. Odds not found'
    else:
        currentsports = current_odds['sports']
        current_runners = currentsports.get('runners', [])
        filter_runners = [item for item in current_runners if str(item.get(
            'selectionId')) == str(selection_id)]
        if filter_runners and filter_runners[0]:
            market_status = filter_runners[0].get('status')
            if market_status in ['ACTIVE', 'OPEN']:
                odds_data = filter_runners[0]['ex']['availableToBack'] if is_back else filter_runners[0]['ex']['availableToLay']
                # print(odds_data)
                if odds_data and len(odds_data) > 0:
                    maximum_odds = max(odds_item['price']
                                       for odds_item in odds_data)
                    print(maximum_odds)
                    minimumodds = min(odds_item['price']
                                      for odds_item in odds_data)
                    if odds > maximum_odds and is_back:
                        return f"{odds} is not valid."
                    if odds < minimumodds and is_back is not True:
                        return f"{odds} is not valid."
                else:
                    return 'No available odds.'
            elif market_status == 'SUSPENDED':
                return f"{selection_name} market is Suspended."
            elif market_status == 'CLOSED':
                return f"{selection_name} market is Closed."
        else:
            return 'Market Suspended.'


def checkFancyOddsConditions(match_id, selection_id, is_back, odds, selection_name):
    current_odds = getcurrentfancyodds(match_id, selection_id)
    print(current_odds)
    if not current_odds or ('sports' not in current_odds) or (current_odds.get('sports') is not None and len(current_odds['sports']) <= 0):
        return 'Bet is not acceptable. Odds not found'
    else:
        currentsports = current_odds['sports'][0]
        market_status = currentsports['GameStatus']
        print(currentsports)
        if market_status == '':
            oddsdata = currentsports['BackPrice1'] if is_back else currentsports['LayPrice1']
            print(odds)
            print(oddsdata)
            if float(odds) != float(oddsdata):
                return f"{odds} is not valid."
        elif market_status == 'SUSPENDED':
            market_status = 'Is Suspended'
        elif market_status == 'Ball Running':
            market_status = 'Is Ball Running'

        if market_status != '':
            return f"{selection_name} market {market_status}"


def checkKey(dict, key):
    if key in dict.keys():
        return True
    else:
        return False


def checkCasinoOddsConditions(game_code, selection_id, is_back, odds_check, stack):
    currentodds = getcurrentCasinoodds(game_code, selection_id)
    #print(currentodds)
    if not currentodds or ('data' not in currentodds):
        return f"data Not found"
    else:
        finalOdds = currentodds['data']
        gstatus = finalOdds['gstatus'] if 'gstatus' in finalOdds else ''
        gstatus = finalOdds['status'] if 'status' in finalOdds else gstatus
        gstatus = finalOdds['tstatus'] if 'tstatus' in finalOdds else gstatus
        #print(gstatus)
        #print("gstatus")
        minStake = finalOdds['min'] if 'min' in finalOdds else 0
        maxStake = finalOdds['max'] if 'max' in finalOdds else 0
        odds = ''
        if gstatus == '1' or gstatus == 'ACTIVE' or gstatus == 'True':
            if is_back:
                if game_code=='testtp':
                    odds = finalOdds['trate'] if int(selection_id)==int(finalOdds['tsection']) else ''
                    odds = finalOdds['lrate'] if int(selection_id)==int(finalOdds['lsection']) else odds
                    odds = finalOdds['drate'] if int(selection_id)==int(finalOdds['dsectionid']) else odds
                else:
                    odds = finalOdds['rate'] if 'rate' in finalOdds else ''
                    odds = finalOdds['b1'] if 'b1' in finalOdds else odds
            else:
                odds = finalOdds['rate'] if 'rate' in finalOdds else ''
                odds = finalOdds['l1'] if 'b1' in finalOdds else odds
            if is_back and odds_check > float(str(odds)):
                return f"{odds} is not valid."
            if not is_back and float(str(odds)) > odds_check:
                return f"{odds} is not valid."
            if float(str(minStake))>float(str(stack)) or float(str(maxStake))<float(str(stack)):
                return f"Check Maximum or Minimum Bet Limit"
        else:
            return "Market is Suspended"

def get_fancy_book(bet_list):
    min_odds = 0
    max_odds = 0

    for index, item1 in enumerate(bet_list):
        if index == 0:
            min_odds = int(item1["odds"])
            max_odds = int(item1["odds"])
        else:
            min_odds = min(int(item1["odds"]), min_odds)
            max_odds = max(int(item1["odds"]), max_odds)

    min_odds = max(0, min_odds - 1)
    max_odds += 1

    new_show_data = {}

    for item1 in bet_list:
        if not item1["isBack"]:
            for i in range(min_odds, max_odds + 1):
                new_show_data[i] = new_show_data.get(i, 0)
                if i < int(item1["odds"]):
                    new_show_data[i] += float(item1["pnl"])
                else:
                    new_show_data[i] += float(item1["loss"])
        else:
            for i in range(min_odds, max_odds + 1):
                new_show_data[i] = new_show_data.get(i, 0)
                if i >= int(item1["odds"]):
                    new_show_data[i] += float(item1["pnl"])
                else:
                    new_show_data[i] += float(item1["loss"])
    print(new_show_data)
    min_value = min(new_show_data.values())

    return abs(min_value)

def get_fancy_position(fancy_bet_list):
    fancy_pl = {}
    # print(fancy_bet_list)
    # print("fancy_bet_list")
    for item_bets in fancy_bet_list:
        selection_id = item_bets['selectionId']
        check_type = True if item_bets['isBack'] else False
        fancy_bet_list_new = [item_bet for item_bet in fancy_bet_list if
                            item_bet['matchId'] == item_bets['matchId'] and
                            item_bet['bet_on'] == BetOn['FANCY'] and item_bet['selectionId'] == item_bets['selectionId']]
        if selection_id not in fancy_pl:
            fancy_pl[selection_id] = 0

        fancyposition = get_fancy_book(fancy_bet_list_new)
        fancy_pl[selection_id] = fancyposition
    return fancy_pl


def get_match_odds_exposer(betlist: List[Dict[str, Any]], match_data: Dict[str, Any]) -> Dict[str, Any]:
    profit = {}
    for item_bets in betlist:
        runner_data_check = next(
            (item_runn for item_runn in match_data['markets'] if item_runn['marketId'] == item_bets['marketId']), None)
        if runner_data_check is None:
            continue
        runner_data = runner_data_check['runners']
        for item_runners in runner_data:
            key = f"{item_bets['marketId']}_{item_runners['selectionId']}"
            if key not in profit:
                profit[key] = 0
            if item_bets['bet_on'] == BetOn['MATCH_ODDS']:
                if item_bets['isBack']:
                    if item_bets['selectionId'] == item_runners['selectionId']:
                        # print(item_bets['pnl'])
                        profit[key] += float(str(item_bets['pnl']))
                    else:
                        # print(item_bets['pnl'])
                        # print("pnl")
                        profit[key] += float(str(item_bets['loss']))
                else:
                    if item_bets['selectionId'] == item_runners['selectionId']:
                        # print(item_bets['pnl'])
                        profit[key] += float(str(item_bets['loss']))
                    else:
                        # print(item_bets['pnl'])
                        profit[key] += float(str(item_bets['pnl']))
    return profit


def getexposerfunction(user, update_status, current_bet):
    try:
        user_bets = list(Bet.find({'status': 'pending', 'userId': ObjectId(
            user['_id'])}, {'_id': 1, 'matchId': 1}))
        event_ids = list(set([item['matchId']
                         for item in user_bets] + [current_bet['matchId']]))
        # print(event_ids)
        complete_bet_list = list(
            Bet.find({'status': 'pending', 'userId': ObjectId(user['_id'])}))
        complete_bet_list.append(current_bet)
        # print(complete_bet_list)
        if event_ids:
            match_list = list(Match.find({'matchId': {'$in': event_ids}}))
            new_match_list = []
            for item in match_list:
                markets = list(Market.find({'matchId': item['matchId']}))
                item['markets'] = markets
                new_match_list.append(item)

            fancy_expo = 0
            main_expo = 0

            for item in new_match_list:
                event_data = item['markets']
                if event_data:
                    for event_event in event_data:
                        bet_list = [item_bet for item_bet in complete_bet_list if
                                    item_bet['matchId'] == item['matchId'] and
                                    item_bet['bet_on'] == BetOn['MATCH_ODDS'] and
                                    item_bet['marketId'] == event_event['marketId']]
                        profit = get_match_odds_exposer(bet_list, item)
                        # print(profit)
                        expo_li = [key for key in profit.values()
                                   if float(key) < 0]
                        main_expo += float(abs(min(expo_li)) if expo_li else 0)

                fancy_bet_list = [item_bet for item_bet in complete_bet_list if
                                  item_bet['matchId'] == item['matchId'] and
                                  item_bet['bet_on'] == BetOn['FANCY']]
                #print(complete_bet_list)
                #print("fancy_bet_listfancy_bet_listfancy_bet_list")
                fancypl = get_fancy_position(fancy_bet_list)
                print(fancypl)
                fancy_expo += float(sum(abs(val) for val in fancypl.values()))

            total_exposer = fancy_expo + main_expo

            if update_status:
                update_ob = {'exposer': total_exposer}
                exposer = Balances.find_one_and_update(
                    {'userId': ObjectId(user['_id'])}, update_ob, {'new': True, 'upsert': True})

            return total_exposer
        else:
            return 'failed'

    except Exception as e:
        print(e)
        return 'failed'


def get_odds_profit(bets: List[Dict], markets: List[Dict]) -> Dict:
    odds_profit = {}

    # Filter MATCH_ODDS bets
    filter_bets = [item for item in bets if item.get('bet_on') == 'MATCH_ODDS']
    #print(filter_bets)
    for bet in filter_bets:
        selection_id_bet = bet.get('selectionId')
        is_back = bet.get('isBack')
        loss_amt = float(str(bet.get('stack')))
        get_odds = bet.get('odds')

        profit_amt = (float(str(get_odds)) - 1) * float(str(loss_amt))

        # Filter markets based on marketId
        filter_market = [item for item in markets if item.get(
            'marketId') == bet.get('marketId')]
        filter_market_data = filter_market[0] if filter_market else {}

        for m_data in filter_market_data.get('runners', []):
            selection_id = m_data.get('selectionId')
            market_id = filter_market_data.get('marketId')
            key_check = str(market_id) + '_' + str(selection_id)
            if key_check not in odds_profit:
                odds_profit[str(market_id) + '_' + str(selection_id)] = 0

            if selection_id == selection_id_bet:
                if is_back:
                    odds_profit[str(market_id) + '_' + str(selection_id)] += profit_amt
                else:
                    odds_profit[str(market_id) + '_' + str(selection_id)] -= profit_amt
            else:
                if is_back:
                    odds_profit[str(market_id) + '_' + str(selection_id)] -= (loss_amt)
                else:
                    odds_profit[str(market_id) + '_' + str(selection_id)] += (loss_amt)

    # Filter FANCY bets
    filter_bets_fancy = [
        item for item in bets if item.get('bet_on') == 'FANCY']
    fancy_profit = {}

    for bet in filter_bets_fancy:
        selection_id = bet.get('selectionId')
        if selection_id not in fancy_profit:
            fancy_profit[selection_id] = 0
        fancy_bet_list_new = [item_bet for item_bet in filter_bets_fancy if
                    item_bet['matchId'] == bet['matchId'] and
                    item_bet['bet_on'] == BetOn['FANCY'] and item_bet['selectionId'] == bet['selectionId']]
        fancybook = get_fancy_book(fancy_bet_list_new)
        fancy_profit[selection_id] = -fancybook

    #print(odds_profit)
    odds_profit.update(fancy_profit)
    return odds_profit


def get_casino_exposer(user: Dict, update_status: bool, current_bet: Dict) -> float:
    try:
        #print("user_bets")
        user_bets = list(Bet.find(
            {"status": "pending", "userId": ObjectId(
                user["_id"]), "bet_on": BetOn['CASINO']},
            {"_id": 1, "matchId": 1, "marketId": 1}
        ))
        #print("user_bets")
        #print(user_bets)
        event_id = list(set([item["matchId"]
                        for item in user_bets] + [current_bet["matchId"]]))
        #print(event_id)

        round_id = []
        for item in user_bets + [current_bet]:
            if item["marketId"] not in [round_item["roundid"] for round_item in round_id]:
                round_id.append(
                    {"match_id": item["matchId"], "roundid": item["marketId"]})

        complete_bet_list = list(Bet.find(
            {"status": "pending", "userId": ObjectId(user["_id"]), "bet_on": BetOn['CASINO']}))
        complete_bet_list.append(current_bet)

        if event_id:
            match_list = list(CasinoMatch.find(
                {"match_id": {"$in": event_id}}))
            match_data = match_list or []

            main_expo = 0
            for item in match_data:
                event_data = item["event_data"]["market"]
                filter_round = [
                    round_item for round_item in round_id if round_item["match_id"] == item["match_id"]]

                if event_data and filter_round:
                    for event_item in event_data:
                        for round_wise in filter_round:
                            bet_list = [
                                bet_item for bet_item in complete_bet_list
                                if bet_item["matchId"] == item["match_id"]
                                and bet_item["bet_on"] == BetOn['CASINO']
                                and bet_item["marketName"] == event_item["MarketName"]
                                and bet_item["marketId"] == round_wise["roundid"]
                            ]

                            if bet_list:
                                if item["match_id"] == 33:
                                    profit = get_cmeter_casino_exposer(
                                        bet_list, item)
                                else:
                                    profit = get_match_casino_exposer(
                                        bet_list, item)
                                #print(profit)
                                #print("profit")
                                expo_li = [
                                    key for key in profit.values() if float(key) < 0]
                                main_expo += abs(min(expo_li)
                                                 ) if expo_li else 0

            total_exposer = main_expo
            #print(total_exposer)
            if update_status:
                update_ob = {"casinoexposer": total_exposer}
                exposer = Balances.find_one_and_update(
                    {"userId": ObjectId(user["_id"])}, {"$set": update_ob}, {
                        "new": True, "upsert": True}
                )
            return total_exposer
        else:
            return "failed"

    except Exception as e:
        print(str(traceback.format_exc()), "error")
        return "failed"


def get_cmeter_casino_exposer(bet_list, match_data):
    profit = {}
    for bet in bet_list:
        runner_data_check = [item for item in match_data["event_data"]
                             ["market"] if item["MarketName"] == bet["marketName"]]
        if not runner_data_check:
            continue
        runner_data = runner_data_check[0]["Runners"]
        for runner in runner_data:
            selection_key = f"{bet['marketId']}_{runner['SelectionId']}"
            profit.setdefault(selection_key, 0)
            if bet['bet_on'] == BetOn['CASINO']:
                if bet['isBack']:
                    if bet['selectionId'] == runner['SelectionId']:
                        profit[selection_key] += bet['loss']
                else:
                    if bet['selectionId'] == runner['SelectionId']:
                        profit[selection_key] += bet['loss']
    return profit


def get_match_casino_exposer(bet_list, match_data):
    profit = {}
    for bet in bet_list:
        runner_data_check = [item for item in match_data["event_data"]
                             ["market"] if item["MarketName"] == bet["marketName"]]
        if not runner_data_check:
            continue
        runner_data = runner_data_check[0]["Runners"]
        for runner in runner_data:
            key = f"{bet['marketId']}_{runner['SelectionId']}"
            profit.setdefault(key, 0)
            if bet['bet_on'] == BetOn['CASINO']:
                if bet['isBack']:
                    if bet['fancystatus'] == 'yes':
                        if bet['selectionId'] == runner['SelectionId']:
                            profit[key] += -int(str(bet['stack']))
                        else:
                            profit[key] += bet['loss']
                    else:
                        if int(bet['selectionId']) == int(runner['SelectionId']):
                            if int(match_data['match_id']) in [52, 41, 44, 46, 35, 9, 13,18, 28, 29, 26, 27, 16]:
                               filter_bets = [item_n for item_n in bet_list if item_n.get('bet_on') == BetOn['CASINO'] and not item_n.get(
                                               'isBack') and item_n.get('marketId') == bet.get('marketId')]
                               if int(match_data['match_id']) == 29 and int(bet['selectionId']) in [13, 14, 27]:
                                     profit[key] += float(str(bet['pnl'])) if len(filter_bets)>0 else bet['loss']
                               elif int(match_data['match_id']) == 26 and int(bet['selectionId']) in [7]:
                                     profit[key] += float(str(bet['pnl'])) if len(filter_bets)>0 else bet['loss']
                               else: 
                                    profit[key] += bet['loss'] if len(
                                        runner_data) == 1 else float(str(bet['pnl']))
                               print( float(str(bet['pnl'])) )
                               print("losssManish")
                            else:
                               print( bet['loss'] )
                               print("losss")
                               profit[key] +=  bet['loss']                                
                        else:
                            profit[key] += bet['loss']
                else:
                    if bet['fancystatus'] == 'yes':
                        if bet['marketName'] == 'Fancy1 Market':
                            profit[key] -= (float(str(bet['odds'])) *
                                            int(str(bet['stack'])) - int(str(bet['stack'])))
                        else:
                            amt = (int(bet['stack']) *
                                   int(bet['volume'])) / 100
                            profit[key] -= amt
                    else:
                        if str(bet['selectionId']) == str(runner['SelectionId']):
                            profit[key] += bet['loss']
                        else:
                            profit[key] += float(str(bet['pnl']))
    return profit

def get_match_casino_exposer_old(bet_list, match_data):
    profit = {}
    for bet in bet_list:
        runner_data_check = [item for item in match_data["event_data"]
                             ["market"] if item["MarketName"] == bet["marketName"]]
        if not runner_data_check:
            continue
        runner_data = runner_data_check[0]["Runners"]
        for runner in runner_data:
            key = f"{bet['marketId']}_{runner['SelectionId']}"
            profit.setdefault(key, 0)
            if bet['bet_on'] == BetOn['CASINO']:
                if bet['isBack']:
                    if bet['fancystatus'] == 'yes':
                        #filter_bets = [item for item in bet_list if
                        #               item['bet_on'] == BetOn['CASINO'] and item['marketId'] == bet['marketId'] and
                        #               not item['isBack']]
                        #print(filter_bets)
                        if bet['selectionId'] == runner['SelectionId']:
                            profit[key] += -int(str(bet['stack']))
                            #if bet['isBack']:
                                #profit[key] += int(sum(item['pnl']
                                #                   for item in filter_bets)) - int(str(bet['stack']))
                                #profit[key] += -int(str(bet['stack']))
                            #else:
                                #profit[key] += bet['loss']
                        else:
                            profit[key] += bet['loss']
                            #if bet['isBack']:
                                # print(sum(item['pnl'] for item in filter_bets))
                                # print('###')
                                #profit[key] += int(sum(item['pnl']
                                 #                  for item in filter_bets)) - int(str(bet['stack']))
                            #else:
                                #profit[key] += bet['loss']
                    else:
                        if int(bet['selectionId']) == int(runner['SelectionId']):
                            #bet['pnl'] if len(
                            #    runner_data) == 1 else
                            print(int(match_data['match_id']))
                            print('int(match_data)')
                            if int(match_data['match_id']) in [52, 41, 44]:
                               print("super over or fivewicket")
                               profit[key] +=  float(str(bet['pnl']))
                            else:
                               profit[key] +=  bet['loss']                                
                        else:
                            print("falsematch")
                            print(int(match_data['match_id']))
                            profit[key] += bet['loss']
                else:
                    if bet['fancystatus'] == 'yes':
                        if bet['marketName'] == 'Fancy1 Market':
                            profit[key] -= (float(str(bet['odds'])) *
                                            int(str(bet['stack'])) - int(str(bet['stack'])))
                        else:
                            amt = (int(bet['stack']) *
                                   int(bet['volume'])) / 100
                            profit[key] -= amt
                    else:
                        #print("mggg")
                        #print(bet['pnl'])
                        #print('pnl')
                        #print(bet['selectionId'])
                        #print(runner['SelectionId'])
                        if str(bet['selectionId']) == str(runner['SelectionId']):
                            profit[key] += bet['loss']
                            #print(profit[key])
                            #print("selectionid")
                        else:
                            profit[key] += bet['pnl']
    return profit


def get_casino_odds_profit(bets: List[Dict[str, Any]], markets: List[Dict[str, Any]], match_info: Dict[str, Any]) -> Dict[str, float]:
    odds_profit = {}
    for item in bets:
        #print(item)
        #print("itemitemitemitem")
        if item.get('bet_on') == BetOn['CASINO']:
            selection_id_bet = item.get('selectionId')
            get_bet_type = item.get('isBack')
            match_id = item.get('matchId')
            #
            loss_amt = item.get('stack') 
            
            if item.get('fancystatus') == 'yes':
                loss_amt = -item.get('loss') 
                
            
            #print(item.get('loss'))          
            #print("itemitemitemitemitem")          
            
            get_odds = item.get('odds')
            profit_amt = 0
            if item.get('fancystatus') == 'yes':
                if item.get('matchId') == 46:
                     if item.get('isBack') == True:
                         profit_amt = item.get('pnl')
                     else:
                         profit_amt = abs(item.get('loss'))                
                else:
                     profit_amt = item.get('pnl')
            else:
                  profit_amt = (float(get_odds) - 1) * float(abs(item.get('stack')))

            if item.get('matchId')==9: 
                 profit_amt = (float(str(get_odds)) / 100) * float(abs(item.get('stack')))
            if item.get('matchId')==33: 
                 profit_amt = float(abs(item.get('stack')) * 50)
                 loss_amt = -float(abs(item.get('stack')) * 50)
            
            #print(profit_amt)
            #print("profit_amtprofit_amtprofit_amt")
            filter_market = [market for market in markets if market.get(
                'MarketName') == item.get('marketName')]
            filter_market_data = filter_market[0]['Runners'] if filter_market else [
            ]
            #print((filter_market_data))

            for m_data in filter_market_data:
                selection_id = m_data.get('SelectionId')
                if odds_profit.get(f"{item.get('marketId')}_{selection_id}") is None:
                    odds_profit[f"{item.get('marketId')}_{selection_id}"] = 0

                if match_info.get('match_id') == 33:
                    if selection_id == selection_id_bet:
                        if get_bet_type:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += loss_amt
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] -= profit_amt
                elif item.get('fancystatus') == 'yes':
                    filter_bets = [item_n for item_n in bets if item_n.get('bet_on') == BetOn['CASINO'] and not item_n.get(
                        'isBack') and item_n.get('marketId') == item.get('marketId')]
                    if str(selection_id) == str(selection_id_bet):
                        if get_bet_type:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += -item.get('stack')
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += -loss_amt
                else:
                    #print(selection_id)
                    #print(selection_id_bet)
                    if str(selection_id) == str(selection_id_bet):
                        if get_bet_type is True:
                            if int(match_id) == 29 and int(selection_id_bet) in [13, 14, 27]:
                                filter_bets = [item_d for item_d in bets if
                                       item_d['bet_on'] == BetOn['CASINO'] and item_d['marketId'] == item['marketId'] and
                                       not item_d['isBack'] and int(selection_id) == item_d['selectionId']]
                                odds_profit[f"{item.get('marketId')}_{selection_id}"] -= -profit_amt if len(filter_bets)>0 else loss_amt
                            elif int(match_id) == 26 and int(selection_id_bet) in [7]:
                                filter_bets = [item_d for item_d in bets if
                                       item_d['bet_on'] == BetOn['CASINO'] and item_d['marketId'] == item['marketId'] and
                                       not item_d['isBack'] and int(selection_id) == item_d['selectionId']]
                                odds_profit[f"{item.get('marketId')}_{selection_id}"] -= -profit_amt if len(filter_bets)>0 else loss_amt
                            else: 
                                odds_profit[f"{item.get('marketId')}_{selection_id}"] += -loss_amt if len(filter_market_data) == 1 else profit_amt
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] -= profit_amt
                    else:
                        if get_bet_type:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] -= loss_amt
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += loss_amt

    return odds_profit

def get_casino_odds_profit_admin(bets: List[Dict[str, Any]], markets: List[Dict[str, Any]], match_info: Dict[str, Any], user_info: Dict[str, Any]) -> Dict[str, float]:
    odds_profit = {}
    #print(user_info)
    for item in bets:
        #print(item['ratioStr'])
        rationCheck = 0
        if 'ratioStr' in item:
            #print(item['ratioStr']['allRatio'])
            desired_parent_id = user_info['_id']  # Replace this with the ID you want to filter
            filtered_list = [items for items in item['ratioStr']['allRatio'] if items.get('parent') == desired_parent_id]
            #print(filtered_list)
            #print("filtered_list")
            rationCheck = filtered_list[0]['ratio'] if len(filtered_list)>0 else 0
            #print(rationCheck)
        #print("itemitemitemitem")
        if item.get('bet_on') == BetOn['CASINO']:
            selection_id_bet = item.get('selectionId')
            get_bet_type = item.get('isBack')
            #
            loss_amt = item.get('stack') 
            
            if item.get('fancystatus') == 'yes':
                loss_amt = -item.get('loss') 
                
            
            #print(item.get('loss'))          
            #print("itemitemitemitemitem")          
            
            get_odds = item.get('odds')
            profit_amt = 0
            if item.get('fancystatus') == 'yes':
                if item.get('matchId') == 46:
                     if item.get('isBack') == True:
                         profit_amt = item.get('pnl')
                     else:
                         profit_amt = abs(item.get('loss'))                
                else:
                     profit_amt = item.get('pnl')
            else:
                  profit_amt = (float(get_odds) - 1) * float(abs(item.get('stack')))

            if item.get('matchId')==9: 
                 profit_amt = (float(str(get_odds)) / 100) * float(abs(item.get('stack')))
            if item.get('matchId')==33: 
                 profit_amt = float(abs(item.get('stack')) * 50)
                 loss_amt = -float(abs(item.get('stack')) * 50)
            
            #print(profit_amt)
            #print("profit_amtprofit_amtprofit_amt")
            filter_market = [market for market in markets if market.get(
                'MarketName') == item.get('marketName')]
            filter_market_data = filter_market[0]['Runners'] if filter_market else [
            ]
            #print((filter_market_data))
            loss_amt = (loss_amt * rationCheck) / 100
            profit_amt = (profit_amt * rationCheck) / 100
            print(profit_amt)
            print('loss_amt')
            for m_data in filter_market_data:
                selection_id = m_data.get('SelectionId')
                if odds_profit.get(f"{item.get('marketId')}_{selection_id}") is None:
                    odds_profit[f"{item.get('marketId')}_{selection_id}"] = 0

                if match_info.get('match_id') == 33:
                    if selection_id == selection_id_bet:
                        if get_bet_type:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += loss_amt
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] -= profit_amt
                elif item.get('fancystatus') == 'yes':
                    filter_bets = [item_n for item_n in bets if item_n.get('bet_on') == BetOn['CASINO'] and not item_n.get(
                        'isBack') and item_n.get('marketId') == item.get('marketId')]
                    if str(selection_id) == str(selection_id_bet):
                        if get_bet_type:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += -((item.get('stack') * rationCheck) / 100)
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += -loss_amt
                else:
                    #print(selection_id)
                    #print(selection_id_bet)
                    if str(selection_id) == str(selection_id_bet):
                        if get_bet_type is True:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += -loss_amt if len(filter_market_data) == 1 else profit_amt
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] -= profit_amt
                    else:
                        if get_bet_type:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] -= loss_amt
                        else:
                            odds_profit[f"{item.get('marketId')}_{selection_id}"] += loss_amt

    return odds_profit

def get_cricket_2020_book(bets: List[Dict[str, Any]], markets: List[Dict[str, Any]], match_info: Dict[str, Any]) -> Dict[str, float]:
    odds_profit = {}
    for item in bets:
        #print(item)
        #print("itemitemitemitem")
        if item.get('bet_on') == BetOn['CASINO']:
            selection_id_bet = item.get('selectionId')
            get_bet_type = item.get('isBack')
            loss_amt = -item.get('loss')
            get_odds = item.get('odds')
            currentRun = int(item.get('selectionId')) + 1

            array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            my_selection = currentRun

            result = [value for value in array if my_selection + value >= 12]
            #print(result)
            #print("resultresultresultresult")
            if get_bet_type is True:
                 profit_amt = round((float(get_odds) - 1) * float(abs(item.get('stack'))))     
            else: 
                 profit_amt = round(item.get('stack'))
            #print(profit_amt)
            #print("profit_amtprofit_amtprofit_amt")
            for m_data in array:
                checkRunn = m_data
                if odds_profit.get(f"{m_data}") is None:
                    odds_profit[f"{m_data}"] = 0
                if m_data in result:
                    if get_bet_type is True:
                        odds_profit[f"{m_data}"] += profit_amt
                    else:
                        odds_profit[f"{m_data}"] -= loss_amt
                else:
                    if get_bet_type is True:
                        odds_profit[f"{m_data}"] -= loss_amt
                    else: 
                        odds_profit[f"{m_data}"] += profit_amt
           
    return odds_profit

def bet_list(user, match_id):
    try:
        #print(user)
        #print(match_id)

        number_float = float(match_id)
        number_int = round(number_float)
        user_id = {'userId': user['_id']} if user['role'] == 'user' else {
            'parentStr': {'$in': [user['_id']]}}
        
        bets = list(Bet.find({
            **user_id,
            'matchId': int(str(number_int)),
            'status': 'pending'
        }).sort('createdAt', -1))
        #print(bets)
        if bets:
            bet_first = bets[0]
            #print(bet_first)
            if bet_first.get('bet_on') != 'CASINO':
                markets = list(Market.find({
                    'matchId': int(str(number_int))
                }))
                #print(markets)
                profit_list = get_odds_profit(bets, markets)
                data_to_serialize = {
                    "message": "",
                    "error": False,
                    "code": 200,
                    "bets": bets,
                    "odds_profit": profit_list,
                }
                #print(data_to_serialize)
                json_data = json.dumps(
                    data_to_serialize, cls=JSONEncoderWithObjectId)
                return json_data
            else:
                markets = CasinoMatch.find_one({
                    'match_id': int(str(number_int))
                })
                
                
                c20_profit = {}
                #get_match_casino_exposer(bets, markets)
                if(user['role']!='user'):
                 c20_profit = get_cricket_2020_book(bets, markets['event_data']['market'], markets) if number_int==35 else get_casino_odds_profit_admin(
                    bets, markets['event_data']['market'], markets, user)
                else:
                    c20_profit = get_cricket_2020_book(bets, markets['event_data']['market'], markets) if number_int==35 else get_casino_odds_profit(
                    bets, markets['event_data']['market'], markets)
                data_to_serialize = {
                    "message": "",
                    "error": False,
                    "code": 200,
                    "bets": bets,
                    "odds_profit": c20_profit,
                }
                #print(data_to_serialize)
                json_data = json.dumps(
                    data_to_serialize, cls=JSONEncoderWithObjectId)
                return json_data
        else:
            data_to_serialize = {
                    "message": "",
                    "error": False,
                    "code": 200,
                    "bets": [],
                    "odds_profit": {},
                }
                #print(data_to_serialize)
            json_data = json.dumps(
                    data_to_serialize, cls=JSONEncoderWithObjectId)
            return json_data
    except Exception as e:
         return error({}, str(e))
