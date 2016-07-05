var path = require('path');
var root = process.cwd();
var signup = require(path.join(root, 'signup'));


var data = {
  firstname: "Test",
  surname: "Test",
  name: "business name",
  email: "test@dsagf342.com",
  phoneCode: 195,
  phone: 12343512,
  country: 'NL',
  language: 'EN',
  website: "website name",
  category: 1,
  URL: "https://test342423.com",
  payeeName: "Payee Name",
  paymentMethod: 3,
  bankName: "Test + Bank",
  address: "dsad + asdasdasda",
  zip: 123,
  city: "dasdasdas",
  accountNo: 123214123121231,
  bankCode: 32131,
  IBAN: "DE99203205004989123456",
  SWIFT: 432423,
  username: "dasfasdsa43242",
  password: "password123",
  affiliateId: 0
};

var leovegas = new signup.leovegas(data);

leovegas.do().then(function (result) {
  console.log('SUCCESS ' + JSON.stringify(result));
}).catch(function (err) {
  console.log('ERROR ' + JSON.stringify(err));
});