const telegram = require('./telegram');
const tokopedia = require('./tokopedia');

const main = async (url) => {
  try {
    const stock = await tokopedia.getStock(url);
    console.log(new Date().toLocaleString(), 'stock', stock.total_stock);
    if (stock && stock.status) await tokopedia.notify(stock);

    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
}

(async () => {
  try {
    setInterval(async () => {
      const url = require('./url.json');
      await Promise.all(url.map(async (u) => {
        try {
          await main(u);
        } catch (err) {
          console.log('err', err);
        }
      }));
    }, 10000);
    // console.log(await tokopedia.getStock("https://www.tokopedia.com/xiaomi/xiaomi-redmi-note-10-pro-6-128gb-amoled-6-67-108mp-nfc-smart-hp-onyx-gray"))

    await telegram.TelegramBot();
  } catch (err) {
    console.log(err);
  }
})();
