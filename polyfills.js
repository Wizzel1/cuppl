import '@azure/core-asynciterator-polyfill';
// import '@bacons/text-decoder/install';
import { Buffer } from '@craftzdog/react-native-buffer';
import 'react-native-get-random-values';
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';
import { ReadableStream } from 'readable-stream';
polyfillGlobal('Buffer', () => Buffer);
polyfillGlobal('ReadableStream', () => ReadableStream);
