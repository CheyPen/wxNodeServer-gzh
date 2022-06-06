export const wxApiDomain = "https://api.weixin.qq.com/";
export const wxConfig = {
  token: 'fang123',
  appID: 'wx31dd918b17a01982',
  appScrect: '83aec1116826ac4dec32e69bef0917ee',
  encodingAESKey: 'GccMiEVGBErzxsKdLlIIsR69A51j25kS89p7TnCiqeV',
  wxApiURLs: {
    accessTokenURL: `${wxApiDomain}cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s`,
    jsApiTicketURL: `${wxApiDomain}cgi-bin/ticket/getticket?access_token=%s&type=jsapi`,
    createMenuURL: `${wxApiDomain}cgi-bin/menu/create?access_token=%s`,
  },
};
