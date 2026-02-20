import { isMobile } from 'react-device-detect'

export const nFormatter = (num: number, digits: number) => {
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup
    .slice()
    .reverse()
    .find((item: any) => {
      return num >= item.value
    })
  return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0'
}
export const dateFormat = 'MMMM Do YYYY, h:mm A'
export const betDateFormat = 'MMMM Do, h:mm:ss A'
export const checkoddslength = isMobile ? 1 : 3

export const calculateTotalNumbersFromString = (inputString: string) => {
  const letterValues: any = {
    K: 13,
    Q: 12,
    A: 1,
    J: 11
  };

  // Define a regular expression to match card values (e.g., "JHH" or "QSS")
  const cardRegex = /[A-Z]+/g;
  const cardMatches = inputString.match(cardRegex);

  // Calculate the total value of cards
  let total = 0;

  if (cardMatches) {
    cardMatches.forEach(card => {
      for (let i = 0; i < card.length; i++) {
        const value = letterValues[card[i]];
        if (value) {
          total += value;
        }
      }
    });
  }

  // Use a regular expression to match all numbers in the input string
  const numberRegex = /\d+/g;
  const numberMatches = inputString.match(numberRegex);

  // Calculate the sum of numeric values
  if (numberMatches) {
    const numericTotal = numberMatches.reduce((acc, num) => acc + parseInt(num), 0);
    total += numericTotal;
  }

  return total;
};

export const replacecardstring = (card:string) => {
  return card.replace('DD', '').replace('CC', '').replace('HH', '').replace('SS', '')
}
export const replacecardstringSuperover = (card:string) => {
  return card.replace('DD', '').replace('CC', '').replace('HH', '').replace('SS', '').replace('1', '').replace('A', '1').replace('K', 'wicket')
}

export const T10MatchStreamingChannel:any = { 
  "australia t10 v new zealand t10": 1036, 
  "india t10 v south africa t10": 1035, 
  "pakistan t10 v south africa t10": 1033, 
  "bangladesh t10 v sri lanka t10": 1034, 
  "england t10 vs india t10": 1035,
  "new zealand t10 v india t10":1033
}