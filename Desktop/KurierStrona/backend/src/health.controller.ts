import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get() // GET /api
  root() {
    return { ok: true, app: 'NowaSolKurier API' };
  }

  @Get('ping') // GET /api/ping
  ping() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
