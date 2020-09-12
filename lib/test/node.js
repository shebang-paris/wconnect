import chai from 'chai';
import spies from 'chai-spies';
import promised from 'chai-as-promised';

import '../node/context.js';

chai.use(spies);
chai.use(promised);
global.expect = chai.expect;
global.spy = chai.spy;
