import axios from 'axios';

global.afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500)); // wait for possible pending requests
  axios.interceptors.request.use(() => {
    throw new Error('Request blocked during teardown');
  });
});