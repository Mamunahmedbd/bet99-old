import AAA from './AAA.json'
import baccarat from './baccarat.json'
import baccarat2 from './baccarat2.json'
import card32 from './AAA.json'
import ddb from './AAA.json'
import dt20 from './AAA.json'
import dt20b from './AAA.json'
import onedaypoker from './AAA.json'
import onedaypoker20 from './AAA.json'
import Tp1Day from './AAA.json'

const datajson = (type:any) => {
    const JsonObject:any = {'AAA':AAA, 'baccarat':baccarat, 'baccarat2':baccarat2, 'card32':card32, "ddb":ddb, "dt20":dt20, "dt20b":dt20b, "onedaypoker":onedaypoker, "onedaypoker20":onedaypoker20, "Tp1Day":Tp1Day}
    return JsonObject[type] ?? ""
}

export default datajson
