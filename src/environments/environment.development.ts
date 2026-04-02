// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  //apirest local
  apiUrl: "http://localhost:3000/api",
  // apiUrlMedia: "http://localhost:3000/api/uploads",

  mediaUrlRemoto: 'https://res.cloudinary.com/dmv6aukai/image/upload/v1741275492/condoParqueCentral/uploads',
  
  //remoto
  // apiUrl: "https://backend-condoparquecentral-mean.onrender.com/api",
  apiUrlMedia: "https://res.cloudinary.com/dmv6aukai/image/upload/v1741275492/condoParqueCentral/uploads",

  //notificaciones
  urlBackedNotification:'https://backend-condoparquecentral-mean.onrender.com/api/notificaciones/save-subscription',
  VAPI_KEY_PUBLIC: 'BNc3MfntrpdWAMI0usltUAh-w1RRvkbD_8QdjZRHPCpLVlCxIm2ZQ4N1w_iX49RUAMNR11Valdl8DlIH6PiYa9U',
  

  clientId: '',
  clientGoogle: ' ',

  

};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
