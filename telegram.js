const Telegraf = require('telegraf');
const urlUpdater = require('./url-updater');
const BotSetting = require('./settings.json');

const checkIsMemberOfGroup = async (ctx) => {
  try {
    const member = await ctx.getChatMember(ctx.message.from.id, BotSetting.group_id);
    if (member.status == 'left') return false;
    return true;
  } catch (err) {
    return false;
  }
}

const TelegramBot = async () => {
  const bot = new Telegraf.Telegraf(BotSetting.BOT_TOKEN);
  try {
    bot.start(async (ctx) => {
      ctx.reply(`Selamat datang di Tokopedia Stok Notifier!
      `);
    });

    bot.command('url', async (ctx) => {
      const urls = ctx.message.text.substr(7).trim();
      const check = await urlUpdater(urls);
      ctx.reply('Produk telah ditambahkan ke daftar notifikasi stok', {
        reply_to_message_id: ctx.message.message_id
      });
    });

    bot.catch(async (err, ctx) => {
      ctx.reply('Ooops, terjadi kesalahan saat menambahkan produk', {
        reply_to_message_id: ctx.message.message_id
      });
    });

    bot.help(async (ctx) => {
      ctx.reply('Gunakan /url {URL PRODUK} untuk menambahkan ke daftar notifikasi stok', {
        reply_to_message_id: ctx.message.message_id
      });
    });

    // Start webhook via launch (preffered)
    if (BotSetting.use_polling) {
      bot.startPolling();
    } else {
      bot.startWebhook(BotSetting.telegram_webhook_path, null, BotSetting.telegram_port);
    }
  }
  catch (err) {
    console.log('err', err)
    return err;
  }
}

module.exports = {
  TelegramBot
}
