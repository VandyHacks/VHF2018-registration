const mailgun = require('mailgun-js')({ apiKey: process.env.MG_API_KEY, domain: 'vandyhacks.org' });
const qr = require('qr-image');

const getQr = data => qr.imageSync(data, { type: 'png', size: 240, margin: 4 });

const baseData = () => {
  return {
    from: 'VandyHacks <info@vandyhacks.org>',
    subject: 'VandyHacks IV - Important information regarding check-in',
    text: '420 blaze it'
  };
};

module.exports = (email, name, id) => {
  mailgun.messages().send(Object.assign(baseData(), {
    to: email,
    attachment: new mailgun.Attachment({
      data: getQr(id),
      filename: 'vh-checkin-code.png',
      contentType: 'image/png'
    })
  }), (err, body) => {
    if (err) {
      console.log(err);
    } else {
      console.log(body);
    }
  });
};