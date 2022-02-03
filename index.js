const url = require('./url.json');
const tokopedia = require('./tokopedia');

const main = async (url) => {
  try {
    const stock = await tokopedia.getStock(url);
    if (stock && stock.status) await tokopedia.notify(stock);

    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
}

(async () => {
  try {
    setInterval(async () => {
      await Promise.all(url.map(async (u) => {
        try {
          await main(u);
        } catch (err) {
          console.log('err', err);
        }
      }));
    }, 10000);
  } catch (err) {
    console.log(err);
  }
})();
