import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:1337/api/results"; // Cambia esto por tu URL de Strapi
const API_TOKEN = "Bearer ec47ea632fed2ba1099fb496edea18f447a0f3320884639bcefeecb2af3d3559433925039e33ad7238dd27ffb96bae6eb2424778a91f78591d1dc5126be523c46a568f0a61f3b8b450a3f829861f6f2131400bc828980ca131fb14e81ced9179d192b7580cdb1657b64292496a5cdf7557a0c1806cfc5eea8cd43923354fc305"; // Reemplaza con tu token de Strapi

export async function GET(req: NextRequest, context: { params: { season: string; race: string; category: string } }) {
  const { params } = context;

  // Esperar los parámetros
  const { season, race, category } = await Promise.resolve(params);

  try {
    // Construir manualmente la URL con los parámetros codificados
    const queryParams = [
      "populate=category",
      `filters%5Bcategory%5D%5Bname%5D%5B%24eq%5D=${encodeURIComponent(category)}`,
      "populate=driver",
      "populate=race.season",
      `filters%5Brace%5D%5Bname%5D%5B%24eq%5D=${encodeURIComponent(race)}`,
      `filters%5Brace%5D%5Bseason%5D%5Bname%5D%5B%24eq%5D=${encodeURIComponent(season)}`,
    ];

    const url = `${API_URL}?${queryParams.join("&")}`;

    console.log("Constructed URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: API_TOKEN,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch results" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error }, { status: 500 });
  }
}