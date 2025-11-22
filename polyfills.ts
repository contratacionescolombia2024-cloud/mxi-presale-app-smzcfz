
import 'react-native-url-polyfill/auto';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (typeof global.process === 'undefined') {
  global.process = require('process');
}

if (typeof global.process.version === 'undefined') {
  global.process.version = 'v16.0.0';
}
