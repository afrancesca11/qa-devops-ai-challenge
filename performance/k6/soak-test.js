import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const fallos = new Rate('fallos');

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    fallos: ['rate<0.05'],
  },
};

export default function () {
  const res = http.get('https://jsonplaceholder.typicode.com/posts/1');
  check(res, { 'status 200': (r) => r.status === 200 });
  fallos.add(res.status !== 200);
  sleep(2);
}
