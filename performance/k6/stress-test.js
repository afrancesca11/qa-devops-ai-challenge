import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const fallos = new Rate('fallos');

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    fallos: ['rate<0.10'],
  },
};

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/posts');
  check(res, { 'status 200': (r) => r.status === 200 });
  fallos.add(res.status !== 200);
  sleep(0.5);
}
