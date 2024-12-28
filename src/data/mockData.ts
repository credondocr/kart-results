// mockData.ts
export interface RaceResult {
  points?: number;
  rank?: number
  number: number;
  country: string;
  driver: string;
  team: string;
  scores: number[];
  worst: number;
}

export interface Class {
  title: string;
  ageGroup: string;
  details: string[];
  categories: Category[];
  img: string;
}

export interface Leaderboard {
  year: number;
  season: string;
  classes: Class[];
}

export interface Category {
  name: string;
  results: RaceResult[];
}

export const mockLeaderboard: Leaderboard = {
  year: 2024,
  season: "Invierno",
  classes: [
    {
      title: "VLR",
      ageGroup: "Age 8-12",
      details: [
        "8-12 years old",
        "950mm CIK/MSUK (Group 3) homologated chassis",
        "IAME 60cc Water Cooled Engine",
        "Vega tyres",
      ],
      img: "https://kartshop.com/images/VLR1-2-p.webp",
      categories: [
        {
          name: "SENIOR",
          results: [
            {
              rank: 1,
              number: 46,
              country: "AD",
              driver: "Alfie DAVIDSON",
              team: "FIK Sport Academy",
              scores: [65, 65, 65, 62, 65, 65],
              points: 0,
              worst: 0
            },
            {
              rank: 2,
              number: 15,
              country: "CR",
              driver: "Daniel FERGUSON",
              team: "Advanced",
              scores: [13, 62, 60, 59, 65, 590],
              points: 0,
              worst: 0
            },
            // Más datos...
          ],
        },
        {
          name: "JUNIOR",
          results: [
            {
              rank: 1,
              number: 46,
              country: "AD",
              driver: "Alfie DAVIDSON",
              team: "FIK Sport Academy",
              scores: [65, 65, 65, 62, 65, 65],
              points: 0,
              worst: 0
            },
            {
              rank: 2,
              number: 15,
              country: "CR",
              driver: "Daniel FERGUSON",
              team: "Advanced",
              scores: [60, 62, 60, 59, 65, 59],
              points: 0,
              worst: 0
            },
            // Más datos...
          ],
        },
        {
          name: "MASTER",
          results: [
            {
              rank: 1,
              number: 46,
              country: "AD",
              driver: "Alfie DAVIDSON",
              team: "FIK Sport Academy",
              scores: [65, 65, 65, 62, 65, 65],
              points: 0,
              worst: 0
            },
            {
              rank: 2,
              number: 15,
              country: "CR",
              driver: "Daniel FERGUSON",
              team: "Advanced",
              scores: [60, 62, 60, 59, 65, 59],
              points: 0,
              worst: 0
            },
            // Más datos...
          ],
        }
      ],
    },

    {
      title: "TILLOTSON",
      ageGroup: "Age 8-12",
      details: [
        "8-12 years old",
        "950mm CIK/MSUK (Group 3) homologated chassis",
        "IAME 60cc Water Cooled Engine",
        "Vega tyres",
      ],
      img: "https://kartshop.com/images/VLR1-2-p.webp",
      categories: [
        {
          name: "HEAVY",
          results: [
            {
              number: 969,
              country: "CR",
              driver: "Cesar Redondo",
              team: "FIK Sport Academy",
              scores: [0, 0, 0, 11, 24.5, 24.5],
              worst: 0
            },
            {
              number: 924,
              country: "CR",
              driver: "Henry Nanne",
              team: "Advanced",
              scores: [0, 42.5, 42.5, 35, 42.5, 42.5],
              worst: 35
            },
            {
              number: 912,
              country: "CR",
              driver: "Nicolas Otero",
              team: "Advanced",
              scores: [0, 28, 31, 0, 0, 0],
              worst: 0
            },
            {
              number: 977,
              country: "CR",
              driver: "Javier Jose Mora",
              team: "MH Racing",
              scores: [0, 30, 30, 41.5, 32, 11],
              worst: 30
            },
            {
              number: 916,
              country: "CR",
              driver: "Erick Mauricio Brenes",
              team: "Advanced",
              scores: [19.5, 0, 0, 0, 5, 21],
              worst: 0
            },
          ],
        },
        {
          name: "JUNIOR",
          results: [
            {
              number: 956,
              country: "CR",
              driver: "Jian Luca Pastore",
              team: "FIK Sport Academy",
              scores: [32.5, 37.5, 42.5, 24, 11, 42.5],
              worst: 35
            },
            {
              number: 945,
              country: "CR",
              driver: "Federico Rojas",
              team: "Advanced",
              scores: [28, 35, 31, 40.5, 0, 0],
              worst: 0
            },
            {
              number: 922,
              country: "CR",
              driver: "Tomas Arias",
              team: "Advanced",
              scores: [0, 30, 24, 30, 35, 33],
              worst: 24
            },
            {
              rank: 2,
              number: 998,
              country: "CR",
              driver: "Santiago Navas",
              team: "Advanced",
              scores: [28, 35, 31, 40.5, 0, 0],
              worst: 42
            },
            {
              rank: 2,
              number: 984,
              country: "CR",
              driver: "Julian Serrano",
              team: "Advanced",
              scores: [33.5, 18.5, 19.5, 25, 24.5, 19.5],
              worst: 38
            },
            {
              rank: 2,
              number: 908,
              country: "CR",
              driver: "Mayra Londoño",
              team: "Advanced",
              scores: [0, 16, 17, 17.5, 19.5, 16],
              worst: 16
            },
            {
              rank: 2,
              number: 928,
              country: "CR",
              driver: "Emil Brautigam ",
              team: "Advanced",
              scores: [19.5, 0, 0, 0, 5, 21],
              worst: 0
            },
            
          ],
        },
        {
          name: "SENIOR",
          results:[
            {
                "rank": 1,
                "number": 905,
                "driver": "Rafael Fabregas",
                "scores": [
                    0,
                    41.5,
                    42.5,
                    35,
                    34,
                    39
                ],
                "worst": 34,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 2,
                "number": 927,
                "driver": "Eduardo Glenn",
                "scores": [
                    39,
                    33,
                    21,
                    23.5,
                    42.5,
                    17.5
                ],
                "worst": 44.5,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 3,
                "number": 920,
                "driver": "Mathias Hernandez",
                "scores": [
                    33.5,
                    20.5,
                    29,
                    22.5,
                    7,
                    0
                ],
                "worst": 7,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 4,
                "number": 971,
                "driver": "Andres Valldeperas",
                "scores": [
                    19.5,
                    20,
                    16,
                    40.5,
                    0,
                    0
                ],
                "worst": 0,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 5,
                "number": 906,
                "driver": "Natalia Br\u00e4utigam",
                "scores": [
                    15.5,
                    26.5,
                    22.5,
                    20,
                    22,
                    11
                ],
                "worst": 35.5,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 6,
                "number": 957,
                "driver": "Osvaldo Blanco",
                "scores": [
                    14.5,
                    9,
                    19.5,
                    15,
                    9.5,
                    28.5
                ],
                "worst": 23.5,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 7,
                "number": 901,
                "driver": "Daniel Sequeira",
                "scores": [
                    17.5,
                    14,
                    15.5,
                    0,
                    15,
                    22.5
                ],
                "worst": 14,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 8,
                "number": 910,
                "driver": "Stefano Morice",
                "scores": [
                    13,
                    16.5,
                    20,
                    15.5,
                    0,
                    0
                ],
                "worst": 0,
                "country": "CR",
                "team": "FIK Sport Academy"
            },
            {
                "rank": 9,
                "number": 929,
                "driver": "Luca Albanese",
                "scores": [
                    11,
                    0,
                    0,
                    13,
                    16.5,
                    6
                ],
                "worst": 0,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 10,
                "number": 921,
                "driver": "Manrique Valverde",
                "scores": [
                    31,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "worst": 0,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 10,
                "number": 991,
                "driver": "Felipe Hernandez",
                "scores": [
                    0,
                    0,
                    0,
                    0,
                    22.5,
                    1
                ],
                "worst": 0,
                "country": "CR",
                "team": "Advanced"
            },
            {
                "rank": 10,
                "number": 917,
                "driver": "Julian Gutierrez",
                "scores": [
                    13,
                    0,
                    0,
                    0,
                    0,
                    0
                ],
                "worst": 0,
                "country": "CR",
                "team": "Advanced"
            }
        ],
        }
      ],
    }
  ],

};

// Función para calcular los puntos y ordenar
function calculatePointsAndSort(data: Leaderboard) {
  data.classes.forEach((classItem) => {
    classItem.categories.forEach((category) => {
      // Filtra resultados para garantizar que no haya elementos undefined
      category.results = category.results.filter((result): result is RaceResult => !!result);

      // Calcula los puntos
      category.results.forEach((result) => {
        if (result == undefined) return 
        result.points = result.scores.reduce((sum, score) => sum + score, 0);
      });

      // Ordena por puntos en orden descendente (considerando 'worst')
      category.results.sort((a, b) => {
        const pointsA = a.points || 0 - a.worst;
        const pointsB = b.points || 0 - b.worst;
        return pointsB - pointsA; // Descendente
      });

      // Actualiza el rango (rank) basado en el nuevo orden
      category.results.forEach((result, index) => {
        result.rank = index + 1;
      });
    });
  });
}

// Actualiza los puntos y ordena los datos en el mockLeaderboard
calculatePointsAndSort(mockLeaderboard);

export default mockLeaderboard;