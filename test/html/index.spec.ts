import haiconSpec from './ha-icon.spec';
import firmwareSpec from './node-info/firmware.spec';
import stateIconSpec from './state-icon.spec';
describe('html', () => {
  describe('node-info', () => {
    firmwareSpec();
  });
  haiconSpec();
  stateIconSpec();
});
