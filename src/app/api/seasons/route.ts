import { NextResponse } from "next/server";

const API_URL = "http://localhost:1337/api/seasons";
const API_TOKEN = "Bearer ec47ea632fed2ba1099fb496edea18f447a0f3320884639bcefeecb2af3d3559433925039e33ad7238dd27ffb96bae6eb2424778a91f78591d1dc5126be523c46a568f0a61f3b8b450a3f829861f6f2131400bc828980ca131fb14e81ced9179d192b7580cdb1657b64292496a5cdf7557a0c1806cfc5eea8cd43923354fc305"; // Cambia esto por tu token de Strapi

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: API_TOKEN,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch seasons" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}