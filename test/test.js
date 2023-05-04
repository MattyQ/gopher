const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const app = require('../index');

chai.use(chaiHttp);

describe('Fetch Content API', () => {
  it('should fetch content successfully', (done) => {
    const testUrl = 'https://example.com/';
    chai
      .request(app)
      .get('/fetchContent')
      .query({ url: testUrl })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.text;
        expect(res.text).to.include('Example Domain');
        done();
      });
  });
});
