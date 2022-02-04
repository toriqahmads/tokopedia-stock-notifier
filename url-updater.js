const fs = require('fs');
const path = require('path');

const updateUrl = async (new_url) => {
  try {
    if (!Array.isArray(new_url)) new_url = new_url.split('\n').map((u) => u.trim());
    let url = [...new_url];

    const isUrlExist = fs.existsSync(path.resolve('url.json'));

    if (!isUrlExist) {
      fs.writeFileSync(path.resolve('url.json'), JSON.stringify(url, null, 2));

      return Promise.resolve(true);
    }

    const savedUrl = JSON.parse(fs.readFileSync(path.resolve('url.json')));

    url = [...savedUrl, ...url];
    fs.writeFileSync(path.resolve('url.json'), JSON.stringify(url, null, 2));

    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(err);
  }
}

updateUrl('https://www.tokopedia.com/xiaomi/xiaomi-redmi-note-10-pro-6-128gb-amoled-6-67-108mp-nfc-smart-hp-onyx-gray').then()

module.exports = updateUrl;
