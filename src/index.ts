import '@center/index';
import { ZoozBasicEditor } from '@common/basic-editor';
import '@hub-card/index';
import '@node-states/index';
import '@z55/index';
import { version } from '../package.json';

// Register the custom element with the browser
customElements.define('zooz-basic-editor', ZoozBasicEditor);

console.info(
  `%c🐱 Poat's Tools: zooz-card-set - ${version}`,
  'color: #CFC493;',
);
