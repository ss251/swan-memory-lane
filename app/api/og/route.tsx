import { ImageResponse } from 'next/og';
import SwanBanner from '../../../components/swan-banner';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <SwanBanner width={1200} height={630} />
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: unknown) {
    const error = e as Error;
    console.log(`${error.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
} 