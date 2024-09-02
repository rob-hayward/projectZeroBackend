import axios from 'axios';

jest.setTimeout(30000); // 30 seconds

afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // wait for possible pending requests
  if (axios.defaults.httpsAgent) {
    axios.defaults.httpsAgent.destroy();
  }
});