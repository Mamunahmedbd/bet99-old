const marketFormatter = (t2: any, marketJson: any) => {
  const finalDataArray: any = [];

  marketJson.event_data.market.map((ItemMarket: any) => {
    const eventMarket: any = {
      MarketName: ItemMarket.MarketName,
      Runners: [],
    };
    ItemMarket.Runners.map((ItemRunner: any) => {
      if (marketJson.slug !== "worliinstant") {
        t2.filter(
          ({ sid, sectionId, tsection }: any) =>
            (sid || sectionId || tsection) == ItemRunner.SelectionId
        ).map((card: any) => {
          if (card) {
            if (card.rate) card.b1 = card.rate;
            card.runnerName = card.nation || card.nat;
            if (marketJson.slug === "race2020") {
              if (card.sid == "6") {
                card.bs1 = 90;
                card.ls1 = 105;
              }
              if (card.sid == "5") {
                card.bs1 = 100;
                card.ls1 = 100;
              }
            }
            eventMarket.Runners.push(card);
          }
        });
      }
      if (
        (marketJson.slug === "worliinstant" ||
          marketJson.slug === "worlimatka") &&
        t2 &&
        t2.length > 0
      ) {
        eventMarket.Runners.push({
          ...ItemRunner,
          mid: t2[0].mid,
          gstatus: t2[0].gstatus,
          sid: ItemRunner.SelectionId,
        });
      }
    });
    finalDataArray.push(eventMarket);
  });

  return finalDataArray;
};

function getParameters(url: string) {
  const urlArray = url.split("?");
  const searchParams = new URLSearchParams(urlArray[1]);
  const paramsArray = [];

  for (const [key, value] of searchParams.entries()) {
    paramsArray.push({ key, value });
  }
  return paramsArray;
}

export { marketFormatter, getParameters };
