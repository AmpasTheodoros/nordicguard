import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function (req: NextRequest) {
    return new Promise<NextResponse>((resolve, reject) => {
      limiter(
        req as any, 
        { 
          setHeader: (name: string, value: string) => {
            // NextResponse doesn't have a setHeader method, so we'll need to create a new response with the headers
            return new NextResponse(null, { 
              headers: { [name]: value },
            });
          },
          status: (statusCode: number) => {
            // Create a new NextResponse with the given status code
            return new NextResponse(null, { status: statusCode });
          },
        } as any, 
        (result: any) => {
          if (result instanceof Error) {
            reject(result);
          } else {
            resolve(handler(req));
          }
        }
      );
    });
  };
}