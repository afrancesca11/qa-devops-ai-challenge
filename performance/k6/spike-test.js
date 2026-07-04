import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 0 },
    { duration: '10s', target: 200 },
    { duration: '30s', target: 200 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.3);
}
