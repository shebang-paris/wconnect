import chai from 'chai';
import spies from 'chai-spies';

import '../node/context.js';

chai.use(spies);
global.expect = chai.expect;
global.spy = chai.spy;
