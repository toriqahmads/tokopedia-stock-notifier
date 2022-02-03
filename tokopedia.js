const axios = require('axios');
const setting = require('./settings.json');

const getStock = async (url) => {
  try {
    const split = url.split('/');

    const shopDomain = split[3].trim();
    const productKey = split[4].trim();

    const data = [{
      operationName: "PDPGetLayoutQuery",
      variables: {
        shopDomain,
        productKey,
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
          'x-tkpd-akamai': 'pdpGetLayout',
          'accept': '*/*',
          'content-type': 'application/json',
          'origin': 'https://www.tokopedia.com'
        }
      }
    )

    let response = false;
    if (!result.data[0].errors || result.data[0].errors.length < 1) {
      response = parseResult(result.data[0].data.pdpGetLayout);
    }

    return Promise.resolve(response);
  } catch (err) {
    return Promise.reject(err);
  }
}

const parseResult = (data) => {
  try {
    const result = {
      status: false,
      total_stock: 0,
      basicInfo: data.basicInfo,
    }

    const variants = data.components.find((component) => component.name == 'variant_options');

    if (variants && variants.data && variants.data.length > 0) {
      let varian = [];
      let children = variants.data[0].children;
      if (!Array.isArray(children)) children = [variants.data[0].children];

      children.forEach((child) => {
        if (child.stock.isBuyable && parseFloat(child.stock.stock) > 0) {
          result.total_stock += parseFloat(child.stock.stock);
          varian.push({
            product_id: child.productID,
            product_name: child.productName,
            product_url: child.productURL,
            price: parseFloat(child.price).toLocaleString('en-US', { maximumFractionDigits: 4 }),
            stock: parseFloat(child.stock.stock),
            minimum_order: parseFloat(child.stock.minimumOrder),
            maximum_order: parseFloat(child.stock.maximumOrder),
            is_buyable: child.stock.isBuyable
          });
        }
      });

      if (varian.length > 0) result.variants = varian;
    }

    if (result.total_stock > 0) result.status = true;

    return result;
  } catch (err) {
    console.log('err', err)
    return false;
  }
}

const postToTelegram = async (text = '') => {
  try {
    await axios.post(
      `${setting.TELEGRAM_API}bot${setting.BOT_TOKEN}/sendMessage`,
      {
        chat_id: setting.CHAT_ID,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
        text
      }
    );

    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
}

const messageParser = (data) => {
  try {
    let message = `
*STOCK UPDATE!!!*
===========================
TOKO: ${data.basicInfo.shopName}
READY STOCK: ${data.status ? 'YA' : 'TIDAK'}
TOTAL STOCK: ${data.total_stock}
MIN ORDER: ${data.basicInfo.minOrder}
MAX ORDER: ${data.basicInfo.maxOrder}
LINK PRODUK UTAMA: [KLIK DISINI](${data.basicInfo.url})

`
if (data.variants && data.variants.length > 0) {
  message += `

VARIAN PRODUK
===========================`
  for (let varian of data.variants) {
    message += `
VARIAN: ${varian.product_name}
HARGA: ${varian.price}
STOCK: ${varian.stock}
MIN ORDER: ${varian.minimum_order}
MAX ORDER: ${varian.maximum_order}
DAPAT DIBELI: ${varian.is_buyable ? 'YA' : 'TIDAK'}
LINK BELI: [KLIK DISINI](${varian.product_url})
=======

`
  }
}

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
  getStock,
  notify
}
