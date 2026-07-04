import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const fallos = new Rate('fallos');
const tiempoRespuesta = new Trend('tiempo_respuesta');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    fallos: ['rate<0.05'],
  },
};

export default function () {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  // GET /posts
  const resGet = http.get(`${BASE_URL}/posts`);
  check(resGet, {
    'GET status 200': (r) => r.status === 200,
    'GET respuesta < 400ms': (r) => r.timings.duration < 400,
  });
  fallos.add(resGet.status !== 200);
  tiempoRespuesta.add(resGet.timings.duration);

  // POST /posts
  const payload = JSON.stringify({
    title: 'foo',
    body: 'bar',
    userId: 1,
  });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const resPost = http.post(`${BASE_URL}/posts`, payload, params);
  check(resPost, {
    'POST status 201': (r) => r.status === 201,
  });
  fallos.add(resPost.status !== 201);

  sleep(1);
}
