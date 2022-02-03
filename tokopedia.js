const axios = require('axios');
const setting = require('./settings.json');

const getStock = async () => {
  try {
    const data = [{
      operationName: "PDPGetLayoutQuery",
      variables: {
        shopDomain: "xiaomi",
        productKey: "xiaomi-mi-redmi-10-4-64gb-layar-6-5-smartphone-android-hp-carbon-gray",
        apiVersion: 1
      },
      query: "fragment ProductVariant on pdpDataProductVariant {\n  errorCode\n  parentID\n  defaultChild\n  sizeChart\n  variants {\n    productVariantID\n    variantID\n    name\n    identifier\n  }\n  children {\n    productID\n    price\n    priceFmt\n    optionID\n    productName\n    productURL\n    stock {\n      stock\n      isBuyable\n      minimumOrder\n      maximumOrder\n    }\n    isCOD\n    isWishlist\n  }\n}\nquery PDPGetLayoutQuery(\n  $shopDomain: String\n  $productKey: String\n  $apiVersion: Float\n) {\n  pdpGetLayout(\n    shopDomain: $shopDomain\n    productKey: $productKey\n    apiVersion: $apiVersion\n  ) {\n    name\n    basicInfo {\n      alias\n      isQA\n      id: productID\n      shopID\n      shopName\n      minOrder\n      maxOrder\n      weight\n      weightUnit\n      condition\n      status\n      url\n      needPrescription\n      catalogID\n      isLeasing\n      isBlacklisted\n    }\n    components {\n      name\n      type\n      data {\n        ...ProductVariant\n      }\n    }\n  }\n}"
    }];

    const result = await axios.post(
      `https://gql.tokopedia.com/`,
      data,
      {
        headers: {
          'x-source': 'tokopedia-lite',
          'x-tkpd-akamai': 'pdpGetLayout'
        }
      }
    )

    console.log(result);
  } catch (err) {
    console.log(err)
  }
}

const postToTelegram = async (text = '') => {
  try {
    await axios.post(
      `${setting.TELEGRAM_API}bot${setting.BOT_TOKEN}/sendMessage`,
      {
        chat_id: setting.CHAT_ID,
        text
      }
    );

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

const messageParser = (data) => {
  try {
    let message = `
NEW TOKEN LISTING DETECTED
===========================

TOKEN INFO
=======
NAME: ${data.nameEn ? data.nameEn : data.nameCn ? data.nameCn : data.nameKr ? data.nameKr : ''}
CATEGORY: ${data.mainCategory} - ${data.subCategory}
MINT: ${data.baseMint}
TAG: #${data.base}${data.quote}
TOTAL SUPPLY: ${data.total_supply}
DECIMAL: ${data.decimals}


MARKET INFO
=======
TICKER: ${data.base}
PAIR: ${data.quote}
ADDRESS: ${data.address}
LINK: ${setting.MARKET_BASE_ADDRESS}${data.address}


TRADE INFO
=======
VOLUME: ${data.summary.volume}
HIGH: ${data.summary.highPrice}
LOW: ${data.summary.lowPrice}
`

if (data.community && data.community.length > 0) {
  message += `

COMMUNITY
=======`
  for (let com of data.community) {
    message += `
${com.name}: ${com.url}`
  }
}

message +=`

===DO WITH YOUR OWN RISK===`;

    return message;
  } catch (err) {
    return '';
  }
}

const notify = async (data) => {
  try {
    const message = messageParser(data);
    if (message != '') {
      try {
        await postToTelegram(message);
      } catch (err) {
        console.log('error send notify to telegram', err);
      }
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

module.exports = {
  getStock
}
