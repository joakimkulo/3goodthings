import { NextResponse } from 'next/server';
import { editionDateFor, nextEightUtc, safeTimeZone } from '../../../lib/delivery-time';

export function GET(request) {
  const timeZone = safeTimeZone(request.nextUrl.searchParams.get('timezone') || 'UTC');
  return NextResponse.json({
    timeZone,
    localDeliveryTime: '08:00',
    editionDate: editionDateFor(timeZone),
    nextDeliveryAt: nextEightUtc(timeZone).toISOString()
  });
}
