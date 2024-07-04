import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import esmock from 'esmock';

describe('retryAxios', () => {
  let axiosInstance, axios, axiosRetry;

  beforeEach(async () => {
    axios = {
      create: sinon.stub().returnsThis(),
      interceptors: {
        response: {
          use: sinon.stub()
        }
      }
    };

    axiosRetry = sinon.stub();

    axiosInstance = await esmock('../../src/utils/retryAxios.js', {
      'axios': axios,
      'axios-retry': axiosRetry
    });
  });

  it('should create an axios instance and configure retry policy', async () => {
    expect(axios.create.calledOnce).to.be.true;
    expect(axiosRetry.calledOnce).to.be.true;

    const [instance, config] = axiosRetry.firstCall.args;
    expect(instance).to.equal(axiosInstance);
    expect(config.retries).to.equal(3);
    expect(config.retryDelay(1)).to.equal(2000);
    expect(config.retryDelay(2)).to.equal(4000);
    expect(config.retryCondition({ response: { status: 429 }})).to.be.true;
    expect(config.retryCondition({ response: { status: 500 }})).to.be.true;
    expect(config.retryCondition({ response: { status: 400 }})).to.be.false;
  });

  it('should retry 3 times before failing for 500 status code', async () => {
    nock('https://api.example.com')
      .get('/resource')
      .reply(500)
      .persist();

    let error;
    try {
      await axiosInstance.get('https://api.example.com/resource');
    } catch (err) {
      error = err;
    }
    expect(error).to.exist;

    nock.cleanAll();
  });

  it('should not retry for 400 status code', async () => {
    nock('https://api.example.com')
      .get('/resource')
      .reply(400);

    let error;
    try {
      await axiosInstance.get('https://api.example.com/resource');
    } catch (err) {
      error = err;
    }

    expect(error).to.exist;

    nock.cleanAll();
  });
});

