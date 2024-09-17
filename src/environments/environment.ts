// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyAXwf_ujRvBDRZXtCPUBdshGBq5pAlRff0",
    authDomain: "errand-mate-ecom.firebaseapp.com",
    databaseURL: "https://errand-mate-ecom-default-rtdb.firebaseio.com",
    projectId: "errand-mate-ecom",
    storageBucket: "errand-mate-ecom.appspot.com",
    messagingSenderId: "543677875269",
    appId: "1:543677875269:web:f53c2b6e0b79d27156cf2c",
    measurementId: "G-NK0KCMLV96"
  },
  loginVerifiedOnly: false,
  serverKey:"AAAAfpW6BEU:APA91bGywCGSy8sl1K-Bu-G4QIWWcV4KVLbVQE2fdMuEAy6wA24J6zwX0pRChMCrwGeWJaAkfUaKQ7OsiJhxosK6m0DEKHxxGQ80fSK03aSOY4BfPpbY23MfMEE0MPTB_-MXOIYXWE2j",
  sendPushEndPoint:  `https://fcm.googleapis.com/fcm/send`,
  webPushCert: 'BA5OVSVNW5t10OltzPzikHVvwlKVTBppak6xIqq7_sLKPWzvvWBbLsqUFEuEVGeQ2KO9LsRuelDzmyvw_gqAVgU',
  otpAPI:{
    sendPinRequest:{
      url: '/otpApi/v3/api/pin/send',
      credentials: {
        app_key          : "I9WhpViPjbmPT0gE",
        app_secret       : "7xnWDUKIPpMcHs8u",
        shortcode_mask   : "UPWARD",
        minute_validity  : 5,
        content          : "Your One-Time-Pin is #{PIN} and valid for #{VALIDITY} minutes. Do not share with others. #{REFCODE}"
      }
    } ,
    verifyPinRequest:{
      url : '/otpApi/v3/api/pin/verify',
      credentials: {
        app_key          : "I9WhpViPjbmPT0gE",
        app_secret       : "7xnWDUKIPpMcHs8u",
      }
    }
  
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
