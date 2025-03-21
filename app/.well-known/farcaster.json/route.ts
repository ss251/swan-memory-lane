import { NextResponse } from 'next/server';

// Base URL for the application
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://swan-memory-lane.vercel.app';

// Image URLs
const ICON_IMG = `${BASE_URL}/images/swan-icon.svg`;
const LOGO_IMG = `${BASE_URL}/images/swan-icon.png`;

export async function GET() {
  const config = {
    "accountAssociation": {
      "header": "eyJmaWQiOjY1NzM3MCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGMzNzNDRjY4ZjNDYWIwODFiZTg2QzFmMEZjN2I2NWFDYTAzNTg3ZDEifQ",
      "payload": "eyJkb21haW4iOiJzd2FuLW1lbW9yeS1sYW5lLnZlcmNlbC5hcHAifQ",
      "signature": "MHg1NWIyNmM4MGJhNGIyN2UxOWMwMjBiNDEzNTkzMmZiYjE5OTE3YmFlZmY1MTc0ZDYxZTBjNDYwMWVmMWI4NzM3Mjg0NzYxZWZiNmJjMDgwN2M1ODcwZGVmMzRkZTk5MGI4NDM3MzFlNDNiN2ViNGI5YzE4ODIxNzRhNmU1YzAyMTFj"
    },
    frame: {
      version: "1",
      name: "Swan Memory Lane",
      iconUrl: LOGO_IMG,
      homeUrl: BASE_URL,
      imageUrl: ICON_IMG,
      buttonTitle: "View Timeline",
      splashImageUrl: ICON_IMG,
      splashBackgroundColor: "#Caf0f8",
      webhookUrl: `${BASE_URL}/api/webhook`
    }
  };

  return NextResponse.json(config);
} 