const tokopedia = require('./tokopedia');

const main = async () => {
  try {
    setInterval(async () => {
      const stock = await tokopedia.getStock();
      console.log('stock', stock);
    }, 60000);
  } catch (err) {
    return Promise.reject(err);
  }
}

(async () => {
  try {
    // await main();
    await tokopedia.getStock();
  } catch (err) {
    console.log(err);
  }
})();
