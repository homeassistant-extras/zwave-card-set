import debugSpec from './debug.spec';
import hassSpec from './hass.spec';
import renderSpec from './render.spec';
import stylesSpec from './styles.spec';

describe('util', () => {
  debugSpec();
  hassSpec();
  renderSpec();
  stylesSpec();
});
