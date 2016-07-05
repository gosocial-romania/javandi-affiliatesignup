var request = require('request');
var Promise = require('bluebird');
var _ = require('underscore');
var moment = require('moment');
var path = require('path');
var root = process.cwd();
var countries = require(path.join(root, 'lib', 'countries'));

function Signup(data) {
  this.GUID = 'FCDE7AF9-2825-4B6F-B3FD-2049DE964E23';
  this.time = moment().add(4, 'hours').format('x');
  this.formUrl = 'https://apis.netrefer.com/signupwebservice48/GenericHandlers/ReturnSignUpHTML.ashx?callback=jsonp' + this.time + '&ClientGUID=' + this.GUID + '&FormType=MAIN&SpecialPermissions=ALL&LanguageCode=EN';
  this.url = 'https://apis.netrefer.com/signupwebservice48/GenericHandlers/JQRegisterAffiliate.ashx';
  this.data = data;
  this.formData = '';

  this.confirmationFields = [{
      name: "ClsUser___Password_confirm",
      value: data.password
  },
    {
      name: "ClsUser___Email_confirm",
      value: data.email
  }];

  this.defaultParams = 'clsAffiliate___seenTc=on&clsAffiliate___ReceivePromotions=on';

  this.config = {
    params: [{
        value: "firstname",
        prefix: "clsAffiliate___firstname"
    },
      {
        value: "surname",
        prefix: "clsAffiliate___surname"
    },
      {
        value: "name",
        prefix: "clsAffiliate___name"
    },
      {
        value: "email",
        prefix: "clsAffiliate___email"
    },
      {
        value: "password",
        prefix: "clsAffiliate___Password"
    },
      {
        value: "phoneCode",
        prefix: "clsAffiliate___telephoneDialCode"
    },
      {
        value: "phone",
        prefix: "clsAffiliate___telephone"
    },
      {
        value: "country",
        prefix: "clsAffiliate___countryId"
    },
      {
        value: "language",
        prefix: "ClsUser___languageId"
    },
      {
        value: "website",
        prefix: "ClsPublishPoint___Name"
    },
      {
        value: "category",
        prefix: "ClsPublishPoint___pubPointCatID"
    },
      {
        value: "URL",
        prefix: "ClsPublishPoint___URL"
    },
      {
        value: "username",
        prefix: "ClsUser___UserName"
    },
      {
        value: "payeeName",
        prefix: "ClsPaymentInfo___payeeName"
    },
      {
        value: "paymentMethod",
        prefix: "ClsPaymentInfo___paymentMethodId"
    },
      {
        value: "bankName",
        prefix: "ClsPaymentInfo___openStorage1"
    },
      {
        value: "address",
        prefix: "ClsPaymentInfo___openStorage2"
    },
      {
        value: "zip",
        prefix: "ClsPaymentInfo___openStorage3"
    },
      {
        value: "city",
        prefix: "ClsPaymentInfo___openStorage4"
    },
      {
        value: "accountNo",
        prefix: "ClsPaymentInfo___openStorage5"
    },
      {
        value: "bankCode",
        prefix: "ClsPaymentInfo___openStorage6"
    },
      {
        value: "IBAN",
        prefix: "ClsPaymentInfo___openStorage7"
    },
      {
        value: "SWIFT",
        prefix: "ClsPaymentInfo___openStorage8"
    },
      {
        value: "affiliateId",
        prefix: "clsAffiliate___parentaffiliateID"
      }]
  };

}

Signup.prototype.validitySpan = function () {
  return new Promise(function (resolve, reject) {
    request.get(this.formUrl, function (err, httpResponse, body) {
      if (err) return reject(err);
      try {
        this.validityToken = body.split('validitySpan');
        this.validityToken = this.validityToken[2].split('value');
        this.validityToken = this.validityToken[1].split('class');
        this.validityToken[0] = this.validityToken[0].replace('\\', '');
        this.validityToken[0] = this.validityToken[0].replace('\\', '');
        this.validityToken[0] = this.validityToken[0].replace('=', '');
        this.validityToken[0] = this.validityToken[0].replace('"', '');
        this.validityToken[0] = this.validityToken[0].replace('"', '');
        this.validityToken = this.validityToken[0];
      } catch (e) {
        return reject(e);
      }
      setTimeout(function () {
        resolve(this.validityToken.trim());
      }.bind(this), 10000);
    }.bind(this));
  }.bind(this));
};

Signup.prototype.processData = function () {
  return new Promise(function (resolve, reject) {
    this.validitySpan().then(function (token) {
      try {
        var countryName = _.findWhere(countries.countryNames, {
          code: this.data.country
        });
        this.data.country = countries.countryCodes[countryName.name];
      } catch (e) {
        return reject(e);
      }
      this.data.language = 1;
      _.each(this.data, function (value, key) {
        var prefix = _.findWhere(this.config.params, {
          value: key
        });
        this.formData += prefix.prefix + '=' + encodeURIComponent(value);
        this.formData += '&';
      }.bind(this));
      _.each(this.confirmationFields, function (object) {
        this.formData += object.name + '=' + encodeURIComponent(object.value) + '&';
      }.bind(this));
      this.formData += this.defaultParams + '&callback=jsonp' + this.time;
      this.formData += '&validitySpan=' + encodeURIComponent(token) + '&ClientGUID=' + this.GUID;
      resolve(this.formData);
    }.bind(this)).catch(reject);
  }.bind(this));
};

Signup.prototype.do = function () {
  return new Promise(function (resolve, reject) {
    this.processData().then(function (data) {
      request.get({
        url: this.url + '?' + data,
      }, function (err, httpResponse, body) {
        if (err) return reject(err);
        var jsonpData = body;
        var json;
        try {
          json = JSON.parse(body);
        } catch (e) {
          var startPos = jsonpData.indexOf('({');
          var endPos = jsonpData.indexOf('})');
          var jsonString = jsonpData.substring(startPos + 1, endPos + 1);
          json = JSON.parse(jsonString);
        }
        if (json.d.indexOf('Error')) return reject(json);
        resolve(json);
      });
    }.bind(this)).catch(reject);
  }.bind(this));
};

module.exports = Signup;