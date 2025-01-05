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

export interface History {
  years: Championship[];
}

export interface Championship {
  year: string;
  verano?: Leaderboard;
  invierno?: Leaderboard;
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

export const mockHistory: History = {
  years: [
    {
      year: '2024',
      invierno: {
        year: 2024,
        season: 'Invierno',
        classes: [
          {
            title: 'KID KART',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    rank: 1,
                    number: 10,
                    driver: 'Omar Rojas',
                    team: 'fmv',
                    country: 'CR',
                    scores: [
                      37.5,
                      41.5,
                      42.5,
                      33.5,
                      34,
                      42.5
                    ],
                    points: 231.5,
                    worst: 67.5
                  },
                  {
                    rank: 2,
                    number: 1,
                    driver: 'Fede Sequeira',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [ 0, 29.5, 29, 24, 42.5, 27 ],
                    points: 152,
                    worst: 24
                  },
                  {
                    rank: 3,
                    number: 5,
                    driver: 'Damian Ramirez',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 28, 28, 30.5, 34, 27, 31 ],
                    points: 178.5,
                    worst: 55
                  },
                  {
                    rank: 4,
                    number: 18,
                    driver: 'Antonio Quesada',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [
                      21.5,
                      26,
                      23,
                      33.5,
                      21.5,
                      24.5
                    ],
                    points: 150,
                    worst: 44.5
                  },
                  {
                    rank: 5,
                    number: 3,
                    driver: 'Ezequiel Gomez',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 38, 0, 0, 0, 0, 0 ],
                    points: 38,
                    worst: 0
                  }
                ]
              }
            ]
          },
          {
            title: 'MICRO ROK',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    rank: 1,
                    number: 711,
                    driver: 'Chayton Rodriguez',
                    team: 'valerio',
                    country: 'CR',
                    scores: [
                      33,
                      36.5,
                      20.5,
                      24,
                      15.5,
                      33
                    ],
                    points: 162.5,
                    worst: 36
                  },
                  {
                    rank: 2,
                    number: 737,
                    driver: 'Enzo Formal',
                    team: 'advanced',
                    country: 'CR',
                    scores: [
                      42.5,
                      17,
                      31,
                      19.5,
                      23.5,
                      22.5
                    ],
                    points: 156,
                    worst: 36.5
                  },
                  {
                    rank: 3,
                    number: 701,
                    driver: 'Samuel Chaverri',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [
                      0,
                      36.5,
                      42.5,
                      17.5,
                      42.5,
                      42.5
                    ],
                    points: 181.5,
                    worst: 79
                  },
                  {
                    rank: 4,
                    number: 708,
                    driver: 'Luciano Albanesse',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [ 28, 15.5, 24, 20, 19.5, 20 ],
                    points: 127,
                    worst: 35
                  },
                  {
                    rank: 5,
                    number: 712,
                    driver: 'Makya Rodriguez',
                    team: 'valerio',
                    country: 'CR',
                    scores: [ 0, 23, 14, 15, 30, 15.5 ],
                    points: 97.5,
                    worst: 14
                  },
                  {
                    rank: 6,
                    number: 721,
                    driver: 'Leandro Ramirez',
                    team: 'fsa',
                    country: 'CR',
                    scores: [ 0, 29, 21.5, 28.5, 14, 19 ],
                    points: 112,
                    worst: 40.5
                  },
                  {
                    rank: 7,
                    number: 704,
                    driver: 'Felipe Nanne',
                    team: 'valerio',
                    country: 'CR',
                    scores: [ 0, 13, 17, 15.5, 15, 16.5 ],
                    points: 77,
                    worst: 13
                  },
                  {
                    rank: 8,
                    number: 717,
                    driver: 'Camila Moreno',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [ 0, 15.5, 12.5, 5, 14, 14 ],
                    points: 61,
                    worst: 5
                  },
                  {
                    rank: 9,
                    number: 715,
                    driver: 'Ayrton Hayes',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 7, 13.5, 37, 0, 0 ],
                    points: 57.5,
                    worst: 7
                  },
                  {
                    rank: 10,
                    number: 700,
                    driver: 'Alejandro Mendoza',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 0, 0, 12.5, 16.5, 14.5 ],
                    points: 43.5,
                    worst: 0
                  }
                ]
              }
            ]
          },
          {
            title: 'MINI ROK',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    rank: 1,
                    number: 517,
                    driver: 'Sofia Calderon',
                    team: 'fmv',
                    country: 'CR',
                    scores: [
                      40,
                      21.5,
                      17.5,
                      30.5,
                      24,
                      20
                    ],
                    points: 153.5,
                    worst: 41.5
                  },
                  {
                    rank: 2,
                    number: 506,
                    driver: 'Samuel Chaverri',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [ 0, 37.5, 39, 20, 42.5, 42.5 ],
                    points: 181.5,
                    worst: 76.5
                  },
                  {
                    rank: 3,
                    number: 555,
                    driver: 'Emilio Wong',
                    team: 'advanced',
                    country: 'CR',
                    scores: [
                      31,
                      19.5,
                      23.5,
                      16.5,
                      0,
                      23.5
                    ],
                    points: 114,
                    worst: 16.5
                  },
                  {
                    rank: 4,
                    number: 510,
                    driver: 'Leandro Ramirez',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 23.5, 16, 26, 18.5, 25, 23 ],
                    points: 132,
                    worst: 34.5
                  },
                  {
                    rank: 5,
                    number: 521,
                    driver: 'Saúl Céspedes',
                    team: 'fmv',
                    country: 'CR',
                    scores: [ 0, 36, 20, 25.5, 30, 31 ],
                    points: 142.5,
                    worst: 45.5
                  },
                  {
                    rank: 6,
                    number: 575,
                    driver: 'Rafael Cañas',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 30.5, 28, 18.5, 19, 0, 0 ],
                    points: 96,
                    worst: 0
                  },
                  {
                    rank: 7,
                    number: 508,
                    driver: 'Luciano Albanese',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [
                      0,
                      14.5,
                      19.5,
                      16,
                      18.5,
                      15.5
                    ],
                    points: 84,
                    worst: 30
                  },
                  {
                    rank: 8,
                    number: 528,
                    driver: 'Nico Salazar',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 0, 0, 39, 0, 0 ],
                    points: 39,
                    worst: 0
                  },
                  {
                    rank: 9,
                    number: 507,
                    driver: 'Jaden Spielman',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 0, 0, 0, 17.5, 17.5 ],
                    points: 35,
                    worst: 0
                  }
                ]
              }
            ]
          },
          {
            title: 'ROK SHIFTER',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    rank: 1,
                    number: 611,
                    driver: 'Felipe Vargas',
                    team: 'fmv',
                    country: 'CR',
                    scores: [ 0, 25.5, 27, 0, 39.5, 42.5 ],
                    points: 134.5,
                    worst: 0
                  },
                  {
                    rank: 2,
                    number: 637,
                    driver: 'Daniel Formal',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 42.5, 42.5, 0, 0, 0 ],
                    points: 85,
                    worst: 0
                  },
                  {
                    rank: 3,
                    number: 612,
                    driver: 'Ricardo Vargas',
                    team: 'fmv',
                    country: 'CR',
                    scores: [ 0, 24, 17, 0, 9.5, 30 ],
                    points: 80.5,
                    worst: 0
                  },
                  {
                    rank: 4,
                    number: 679,
                    driver: 'Ricardo Esquivel',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [
                      0,
                      18.5,
                      20.5,
                      0,
                      19.5,
                      21.5
                    ],
                    points: 80,
                    worst: 0
                  },
                  {
                    rank: 5,
                    number: 680,
                    driver: 'Jose Montalto',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 21, 29.5, 0, 0, 0 ],
                    points: 50.5,
                    worst: 0
                  },
                  {
                    rank: 6,
                    number: 671,
                    driver: 'Andres Valdeperas',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 0, 0, 0, 0, 29, 12 ],
                    points: 41,
                    worst: 0
                  },
                  {
                    rank: 7,
                    number: 617,
                    driver: 'Mauricio Hernandez',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [ 0, 0, 0, 0, 34, 0 ],
                    points: 34,
                    worst: 0
                  },
                  {
                    rank: 8,
                    number: 617,
                    driver: 'Jose Hernandez',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [ 0, 0, 0, 0, 0, 22.5 ],
                    points: 22.5,
                    worst: 0
                  },
                  {
                    rank: 9,
                    number: 615,
                    driver: 'Gabriel Kawer',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 22, 22, 0, 0, 0 ],
                    points: 22,
                    worst: 0
                  },
                  {
                    rank: 10,
                    number: 616,
                    driver: 'Charlie Fonseca',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 1, 0, 0, 0, 0 ],
                    points: 1,
                    worst: 0
                  }
                ]
              }
            ]
          },
          {
            title: 'STARS OF TOMORROW',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    rank: 1,
                    number: 155,
                    driver: 'Carlos Andres Valverde',
                    team: 'fik',
                    country: 'CR',
                    scores: [
                      42.5,
                      41.5,
                      41.5,
                      37.5,
                      26,
                      21.5
                    ],
                    points: 210.5,
                    worst: 47.5
                  },
                  {
                    rank: 2,
                    number: 105,
                    driver: 'Emilio Bolaños',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 0, 5, 26, 0, 42.5, 42.5 ],
                    points: 116,
                    worst: 0
                  },
                  {
                    rank: 3,
                    number: 141,
                    driver: 'Jaden Spielman',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 0, 7, 12.5, 30.5, 22, 31 ],
                    points: 103,
                    worst: 12.5
                  },
                  {
                    rank: 4,
                    number: 152,
                    driver: 'Daniela Dorado',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 15.5, 8, 18.5, 22, 30, 30 ],
                    points: 124,
                    worst: 34
                  },
                  {
                    rank: 5,
                    number: 124,
                    driver: 'Julian Lahmann',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 0, 24.5, 33, 29, 10.5, 0 ],
                    points: 97,
                    worst: 10.5
                  },
                  {
                    rank: 6,
                    number: 119,
                    driver: 'Matthew Phillips',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [ 28, 27, 14, 13.5, 10.5, 15 ],
                    points: 108,
                    worst: 24
                  },
                  {
                    rank: 7,
                    number: 127,
                    driver: 'Isabella Hernandez',
                    team: 'advanced',
                    country: 'CR',
                    scores: [
                      19.5,
                      12.5,
                      9.5,
                      19.5,
                      14.5,
                      16.5
                    ],
                    points: 92,
                    worst: 22
                  },
                  {
                    rank: 8,
                    number: 198,
                    driver: 'Theo Grunwedl',
                    team: 'advanced',
                    country: 'CR',
                    scores: [
                      13,
                      22,
                      18,
                      14.5,
                      14.5,
                      12.5
                    ],
                    points: 94.5,
                    worst: 25.5
                  },
                  {
                    rank: 9,
                    number: 184,
                    driver: 'Montserrat Monge',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 14, 16, 19.5, 13, 12, 10.5 ],
                    points: 85,
                    worst: 22.5
                  },
                  {
                    rank: 10,
                    number: 107,
                    driver: 'Marcelo Piñago',
                    team: 'valerio',
                    country: 'CR',
                    scores: [ 9.5, 14, 13, 13, 16.5, 16.5 ],
                    points: 82.5,
                    worst: 22.5
                  },
                  {
                    rank: 11,
                    number: 108,
                    driver: 'Fabian Vargas',
                    team: 'valerio',
                    country: 'CR',
                    scores: [ 9, 18.5, 7.5, 15, 9, 11 ],
                    points: 70,
                    worst: 16.5
                  },
                  {
                    rank: 12,
                    number: 197,
                    driver: 'Valentina Giraldo',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 20.5, 0, 0, 0, 11, 9 ],
                    points: 40.5,
                    worst: 0
                  },
                  {
                    rank: 13,
                    number: 144,
                    driver: 'Abraham Murillo',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 32, 0, 0, 0, 0, 0 ],
                    points: 32,
                    worst: 0
                  },
                  {
                    rank: 14,
                    number: 172,
                    driver: 'Luca de la Cruz',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 10, 13.5, 6.5, 0, 0, 0 ],
                    points: 30,
                    worst: 0
                  },
                  {
                    rank: 15,
                    number: 164,
                    driver: 'Julian de la Cruz',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 8.5, 5, 9, 0, 0, 0 ],
                    points: 22.5,
                    worst: 0
                  }
                ]
              }
            ]
          },
          {
            title: 'TILLOTSON',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: 'TILLOTSON - HEAVY',
                results: [
                  {
                    number: 969,
                    country: 'CR',
                    driver: 'Cesar Redondo',
                    team: 'fsa',
                    scores: [ 0, 0, 0, 11, 24.5, 24.5 ],
                    worst: 0
                  },
                  {
                    number: 924,
                    country: 'CR',
                    driver: 'Henry Nanne',
                    team: 'valerio',
                    scores: [
                      0,
                      42.5,
                      42.5,
                      35,
                      42.5,
                      42.5
                    ],
                    worst: 35
                  },
                  {
                    number: 912,
                    country: 'CR',
                    driver: 'Nicolas Otero',
                    team: 'Advanced',
                    scores: [ 0, 28, 31, 0, 0, 0 ],
                    worst: 0
                  },
                  {
                    number: 977,
                    country: 'CR',
                    driver: 'Javier Jose Mora',
                    team: 'mhkarting',
                    scores: [ 0, 30, 30, 41.5, 32, 11 ],
                    worst: 30
                  },
                  {
                    number: 916,
                    country: 'CR',
                    driver: 'Erick Mauricio Brenes',
                    team: 'advanced',
                    scores: [ 19.5, 0, 0, 0, 5, 21 ],
                    worst: 0
                  }
                ]
              },
              {
                name: 'TILLOTSON - JUNIOR',
                results: [
                  {
                    number: 956,
                    country: 'CR',
                    driver: 'Jian Luca Pastore',
                    team: 'mhkarting',
                    scores: [
                      32.5,
                      37.5,
                      42.5,
                      24,
                      11,
                      42.5
                    ],
                    worst: 35
                  },
                  {
                    number: 945,
                    country: 'CR',
                    driver: 'Federico Rojas',
                    team: 'Advanced',
                    scores: [ 28, 35, 31, 40.5, 0, 0 ],
                    worst: 0
                  },
                  {
                    number: 922,
                    country: 'CR',
                    driver: 'Tomas Arias',
                    team: 'valerio',
                    scores: [ 0, 30, 24, 30, 35, 33 ],
                    worst: 24
                  },
                  {
                    rank: 2,
                    number: 998,
                    country: 'CR',
                    driver: 'Santiago Navas',
                    team: 'advanced',
                    scores: [ 28, 35, 31, 40.5, 0, 0 ],
                    worst: 42
                  },
                  {
                    rank: 2,
                    number: 984,
                    country: 'CR',
                    driver: 'Julian Serrano',
                    team: 'Advanced',
                    scores: [
                      33.5,
                      18.5,
                      19.5,
                      25,
                      24.5,
                      19.5
                    ],
                    worst: 38
                  },
                  {
                    rank: 2,
                    number: 908,
                    country: 'CR',
                    driver: 'Mayra Londoño',
                    team: 'Advanced',
                    scores: [ 0, 16, 17, 17.5, 19.5, 16 ],
                    worst: 16
                  },
                  {
                    rank: 2,
                    number: 928,
                    country: 'CR',
                    driver: 'Emil Brautigam ',
                    team: 'fik',
                    scores: [ 19.5, 0, 0, 0, 5, 21 ],
                    worst: 0
                  }
                ]
              },
              {
                name: 'TILLOTSON - SENIOR',
                results: [
                  {
                    rank: 1,
                    number: 905,
                    driver: 'Rafael Fabregas',
                    scores: [ 0, 41.5, 42.5, 35, 34, 39 ],
                    worst: 34,
                    country: 'PA',
                    team: 'fmv'
                  },
                  {
                    rank: 2,
                    number: 927,
                    driver: 'Eduardo Glenn',
                    scores: [
                      39,
                      33,
                      21,
                      23.5,
                      42.5,
                      17.5
                    ],
                    worst: 44.5,
                    country: 'CR',
                    team: 'Advanced'
                  },
                  {
                    rank: 3,
                    number: 920,
                    driver: 'Mathias Hernandez',
                    scores: [ 33.5, 20.5, 29, 22.5, 7, 0 ],
                    worst: 7,
                    country: 'CR',
                    team: 'fik'
                  },
                  {
                    rank: 4,
                    number: 971,
                    driver: 'Andres Valldeperas',
                    scores: [ 19.5, 20, 16, 40.5, 0, 0 ],
                    worst: 0,
                    country: 'CR',
                    team: 'Advanced'
                  },
                  {
                    rank: 5,
                    number: 906,
                    driver: 'Natalia Bräutigam',
                    scores: [
                      15.5,
                      26.5,
                      22.5,
                      20,
                      22,
                      11
                    ],
                    worst: 35.5,
                    country: 'CR',
                    team: 'Advanced'
                  },
                  {
                    rank: 6,
                    number: 957,
                    driver: 'Osvaldo Blanco',
                    scores: [
                      14.5,
                      9,
                      19.5,
                      15,
                      9.5,
                      28.5
                    ],
                    worst: 23.5,
                    country: 'CR',
                    team: 'fmv'
                  },
                  {
                    rank: 7,
                    number: 901,
                    driver: 'Daniel Sequeira',
                    scores: [ 17.5, 14, 15.5, 0, 15, 22.5 ],
                    worst: 14,
                    country: 'CR',
                    team: 'losprimos'
                  },
                  {
                    rank: 8,
                    number: 910,
                    driver: 'Stefano Morice',
                    scores: [ 13, 16.5, 20, 15.5, 0, 0 ],
                    worst: 0,
                    country: 'CR',
                    team: 'fsa'
                  },
                  {
                    rank: 9,
                    number: 929,
                    driver: 'Luca Albanese',
                    scores: [ 11, 0, 0, 13, 16.5, 6 ],
                    worst: 0,
                    country: 'CR',
                    team: 'mhkarting'
                  },
                  {
                    rank: 10,
                    number: 921,
                    driver: 'Manrique Valverde',
                    scores: [ 31, 0, 0, 0, 0, 0 ],
                    worst: 0,
                    country: 'CR',
                    team: 'Advanced'
                  },
                  {
                    rank: 10,
                    number: 991,
                    driver: 'Felipe Hernandez',
                    scores: [ 0, 0, 0, 0, 22.5, 1 ],
                    worst: 0,
                    country: 'CR',
                    team: 'advanced'
                  },
                  {
                    rank: 10,
                    number: 917,
                    driver: 'Julian Gutierrez',
                    scores: [ 13, 0, 0, 0, 0, 0 ],
                    worst: 0,
                    country: 'CR',
                    team: 'Advanced'
                  }
                ]
              }
            ]
          },
          {
            title: 'VLR',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: 'VLR JUNIOR',
                results: [
                  {
                    rank: 1,
                    number: 236,
                    driver: 'Jose Alejandro Halphen',
                    team: 'fmv',
                    country: 'PA',
                    scores: [
                      27,
                      17,
                      22.5,
                      37.5,
                      27,
                      41.5
                    ],
                    points: 172.5,
                    worst: 39.5
                  },
                  {
                    rank: 2,
                    number: 244,
                    driver: 'Fabian Acevedo',
                    team: 'fik',
                    country: 'CR',
                    scores: [
                      42.5,
                      36.5,
                      21.5,
                      25,
                      23.5,
                      24.5
                    ],
                    points: 173.5,
                    worst: 45
                  },
                  {
                    rank: 3,
                    number: 226,
                    driver: 'Gerardo Moreno',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [
                      26.5,
                      26.5,
                      40.5,
                      32.5,
                      11.5,
                      20.5
                    ],
                    points: 158,
                    worst: 32
                  },
                  {
                    rank: 4,
                    number: 207,
                    driver: 'Anouk Valerio',
                    team: 'valerio',
                    country: 'CR',
                    scores: [ 19, 27.5, 11, 22, 35, 13 ],
                    points: 127.5,
                    worst: 24
                  },
                  {
                    rank: 5,
                    number: 229,
                    driver: 'Luis Fernando Cedeño',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [
                      17.5,
                      13,
                      14,
                      20.5,
                      37.5,
                      7.5
                    ],
                    points: 110,
                    worst: 20.5
                  },
                  {
                    rank: 6,
                    number: 220,
                    driver: 'Benjamin Beckley',
                    team: 'fmv',
                    country: 'CR',
                    scores: [
                      15.5,
                      11.5,
                      31,
                      14,
                      17.5,
                      22
                    ],
                    points: 111.5,
                    worst: 25.5
                  },
                  {
                    rank: 7,
                    number: 217,
                    driver: 'Samuel Castro',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 17, 11, 14.5, 16, 10, 16 ],
                    points: 84.5,
                    worst: 21
                  },
                  {
                    rank: 8,
                    number: 216,
                    driver: 'Luciano Dajles',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [
                      0,
                      12.5,
                      4.5,
                      14.5,
                      14.5,
                      15
                    ],
                    points: 61,
                    worst: 4.5
                  },
                  {
                    rank: 9,
                    number: 218,
                    driver: 'Luciana Morales',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 16.5, 6, 8, 5, 7, 17 ],
                    points: 59.5,
                    worst: 13
                  },
                  {
                    rank: 10,
                    number: 294,
                    driver: 'Francesca Morice',
                    team: 'advanced',
                    country: 'CR',
                    scores: [ 9, 5, 13.5, 10.5, 7, 13 ],
                    points: 58,
                    worst: 12
                  },
                  {
                    rank: 11,
                    number: 235,
                    driver: 'Andres Dumith',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 8.5, 13, 6.5, 13.5, 15.5 ],
                    points: 57,
                    worst: 15
                  },
                  {
                    rank: 12,
                    number: 222,
                    driver: 'Sebastian Delgado',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 10.5, 4.5, 7, 7.5, 7, 10.5 ],
                    points: 47,
                    worst: 11.5
                  },
                  {
                    rank: 13,
                    number: 267,
                    driver: 'Lautaro Otero',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 14.5, 14.5, 0, 0, 0 ],
                    points: 29,
                    worst: 0
                  },
                  {
                    rank: 14,
                    number: 277,
                    driver: 'Alessandro Carboni',
                    team: 'advanced',
                    country: 'CR',
                    scores: [ 0, 4, 1, 7, 15, 6.5 ],
                    points: 33.5,
                    worst: 5
                  },
                  {
                    rank: 15,
                    number: 272,
                    driver: 'Luis Pedro Barrientos Jr',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 11.5, 17, 0, 0, 0 ],
                    points: 28.5,
                    worst: 0
                  },
                  {
                    rank: 16,
                    number: 223,
                    driver: 'Diego Ardiles',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 27, 1, 0, 0, 0 ],
                    points: 28,
                    worst: 0
                  },
                  {
                    rank: 17,
                    number: 247,
                    driver: 'Diego Mejia',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 2.5, 0, 0, 10, 5.5, 8 ],
                    points: 26,
                    worst: 0
                  },
                  {
                    rank: 18,
                    number: 201,
                    driver: 'Alberto Rojas Segura',
                    team: 'advanced',
                    country: 'CR',
                    scores: [ 7, 3, 2.5, 6, 0, 0 ],
                    points: 18.5,
                    worst: 0
                  },
                  {
                    rank: 19,
                    number: 255,
                    driver: 'Julian Regueyra',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 15, 0, 0, 0, 0, 0 ],
                    points: 15,
                    worst: 0
                  }
                ]
              },
              {
                name: 'VLR MASTER',
                results: [
                  {
                    rank: 1,
                    number: 317,
                    driver: 'Andres Fonseca',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 42.5, 42.5, 36.5, 40, 34, 0 ],
                    points: 195.5,
                    worst: 34
                  },
                  {
                    rank: 2,
                    number: 327,
                    driver: 'Tim Vivian',
                    team: 'valerio',
                    country: 'CR',
                    scores: [
                      24,
                      32,
                      23.5,
                      22.5,
                      42.5,
                      33.5
                    ],
                    points: 178,
                    worst: 46
                  },
                  {
                    rank: 3,
                    number: 365,
                    driver: 'David Gardella Sr',
                    team: 'advanced',
                    country: 'CR',
                    scores: [ 29, 17.5, 19, 32, 25, 36 ],
                    points: 158.5,
                    worst: 36.5
                  },
                  {
                    rank: 4,
                    number: 325,
                    driver: 'Paulo Sequeira',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [ 17.5, 22, 35, 0, 17.5, 32 ],
                    points: 124,
                    worst: 17.5
                  },
                  {
                    rank: 5,
                    number: 396,
                    driver: 'Luis Alvarado',
                    team: 'valerio',
                    country: 'CR',
                    scores: [
                      20.5,
                      21.5,
                      26,
                      30.5,
                      18.5,
                      20.5
                    ],
                    points: 137.5,
                    worst: 39
                  },
                  {
                    rank: 6,
                    number: 319,
                    driver: 'Pablo Bolaños',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 0, 19, 16.5, 0, 16, 15 ],
                    points: 66.5,
                    worst: 0
                  },
                  {
                    rank: 7,
                    number: 376,
                    driver: 'Peppe Di Falco',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 25, 18.5, 6.5, 0, 0, 0 ],
                    points: 50,
                    worst: 0
                  }
                ]
              },
              {
                name: 'VLR SENIOR',
                results: [
                  {
                    rank: 1,
                    number: 305,
                    driver: 'Bernal Valverde',
                    team: 'fmv',
                    country: 'CR',
                    scores: [ 40, 10.5, 27, 34.5, 28, 30 ],
                    points: 170,
                    worst: 37.5
                  },
                  {
                    rank: 2,
                    number: 316,
                    driver: 'Charlie Fonseca',
                    team: 'fik',
                    country: 'CR',
                    scores: [
                      19.5,
                      23.5,
                      15.5,
                      33,
                      32,
                      21.5
                    ],
                    points: 145,
                    worst: 35
                  },
                  {
                    rank: 3,
                    number: 311,
                    driver: 'Mauricio Hernandez',
                    team: 'mhkarting',
                    country: 'CR',
                    scores: [ 0, 0, 0, 22.5, 42.5, 42.5 ],
                    points: 107.5,
                    worst: 0
                  },
                  {
                    rank: 4,
                    number: 345,
                    driver: 'Luciano Sosto',
                    team: 'advanced',
                    country: 'CR',
                    scores: [
                      18.5,
                      12.5,
                      8.5,
                      20.5,
                      17.5,
                      31
                    ],
                    points: 108.5,
                    worst: 21
                  },
                  {
                    rank: 5,
                    number: 315,
                    driver: 'Luis Felipe Aguilar',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 36.5, 24, 21.5, 21, 0, 16 ],
                    points: 119,
                    worst: 37
                  },
                  {
                    rank: 6,
                    number: 344,
                    driver: 'Augusto Acevedo',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 10, 6, 15.5, 22, 22.5, 17.5 ],
                    points: 93.5,
                    worst: 16
                  },
                  {
                    rank: 7,
                    number: 337,
                    driver: 'Danny Formal',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 35, 42.5, 0, 0, 0 ],
                    points: 77.5,
                    worst: 0
                  },
                  {
                    rank: 8,
                    number: 323,
                    driver: 'Diego Ardiles',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 41.5, 34, 0, 0, 0 ],
                    points: 75.5,
                    worst: 0
                  },
                  {
                    rank: 9,
                    number: 342,
                    driver: 'Martin Salom',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 7.5, 13, 10.5, 14, 12, 14.5 ],
                    points: 71.5,
                    worst: 18
                  },
                  {
                    rank: 10,
                    number: 310,
                    driver: 'David Gardella',
                    team: 'advanced',
                    country: 'CR',
                    scores: [ 13, 10, 5, 12.5, 16, 12 ],
                    points: 68.5,
                    worst: 15
                  },
                  {
                    rank: 11,
                    number: 302,
                    driver: 'Andres Ardiles',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 22, 9.5, 17, 0, 0, 0 ],
                    points: 48.5,
                    worst: 0
                  },
                  {
                    rank: 12,
                    number: 384,
                    driver: 'Sebastian Arce',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 16.5, 15.5, 11.5, 0, 0, 0 ],
                    points: 43.5,
                    worst: 0
                  },
                  {
                    rank: 13,
                    number: 309,
                    driver: 'Franco Segnini',
                    team: 'advanced',
                    country: 'CR',
                    scores: [ 0, 0, 0, 16, 14.5, 12.5 ],
                    points: 43,
                    worst: 0
                  },
                  {
                    rank: 14,
                    number: 351,
                    driver: 'Daniel Gardella',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 12, 9.5, 8, 11.5, 0, 0 ],
                    points: 41,
                    worst: 0
                  },
                  {
                    rank: 15,
                    number: 398,
                    driver: 'Isabella Valldeperas',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 17, 11, 8, 3.5, 0, 0 ],
                    points: 39.5,
                    worst: 0
                  },
                  {
                    rank: 16,
                    number: 314,
                    driver: 'Daniel Mendez',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 10.5, 11, 8, 0, 0, 0 ],
                    points: 29.5,
                    worst: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      verano: {
        year: 2024,
        season: 'Invierno',
        classes: [
          {
            title: 'KID KART',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    rank: 1,
                    number: 10,
                    driver: 'Omar Rojas',
                    team: 'fmv',
                    country: 'CR',
                    scores: [
                      37.5,
                      42.5,
                      40,
                      38,
                      29
                    ],
                    points: 231.5,
                    worst: 0
                  },
                  {
                    rank: 2,
                    number: 1,
                    driver: 'Fede Sequeira',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [ 39, 30.5, 36.5, 36.5, 33 ],
                    points: 152,
                    worst: 30.5
                  },
                  {
                    rank: 3,
                    number: 5,
                    driver: 'Damian Ramirez',
                    team: 'fik',
                    country: 'CR',
                    scores: [ 23, 25, 21.5, 18.5, 20.5 ],
                    worst: 18.5
                  },
                  {
                    rank: 4,
                    number: 18,
                    driver: 'Antonio Quesada',
                    team: 'losprimos',
                    country: 'CR',
                    scores: [
                      25.5,
                      27,
                      27,
                      20.5,
                      18.5
                    ],
                    points: 150,
                    worst: 18.5
                  },
                  {
                    rank: 5,
                    number: 3,
                    driver: 'Ezequiel Gomez',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 0, 0, 0, 29, 41.5 ],
                    points: 38,
                    worst: 0
                  },
                  {
                    rank: 5,
                    number: 9,
                    driver: 'Lisandro Salas',
                    team: 'Advanced',
                    country: 'CR',
                    scores: [ 17, 0, 0, 0, 0 ],
                    points: 38,
                    worst: 0
                  }
                ]
              }
            ]
          },
          {
            title: 'MICRO ROK',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    "rank": 1,
                    "number": 721,
                    "driver": "Leandro Ramirez",
                    "team": "formula",
                    "country": "CR",
                    "scores": [37.5, 38.5, 30.5, 33.5, 32],
                    "points": 141.5,
                    "worst": 30.5
                  },
                  {
                    "rank": 2,
                    "number": 728,
                    "driver": "Nico Salazar",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [38, 0, 24, 36, 33.5],
                    "points": 131.5,
                    "worst": 0
                  },
                  {
                    "rank": 3,
                    "number": 701,
                    "driver": "Samuel Chaverri",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [0, 25, 34, 34, 38],
                    "points": 131,
                    "worst": 0
                  },
                  {
                    "rank": 4,
                    "number": 737,
                    "driver": "Enzo Formal",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [20, 23.5, 19.5, 19.5, 19.5],
                    "points": 82.5,
                    "worst": 19.5
                  },
                  {
                    "rank": 5,
                    "number": 715,
                    "driver": "Ayrton Hayes",
                    "team": "Advanced",
                    "country": "CR",
                    "scores": [14, 0, 21.5, 19.5, 19.5],
                    "points": 74.5,
                    "worst": 0
                  },
                  {
                    "rank": 6,
                    "number": 777,
                    "driver": "Samantha Thomas",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [26.5, 21, 27, 0, 0],
                    "points": 74.5,
                    "worst": 0
                  },
                  {
                    "rank": 7,
                    "number": 717,
                    "driver": "Camila Moreno",
                    "team": "losprimos",
                    "country": "CR",
                    "scores": [14.5, 0, 14.5, 15, 6],
                    "points": 50,
                    "worst": 0
                  },
                  {
                    "rank": 8,
                    "number": 708,
                    "driver": "Luciano Albanese",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [20, 29, 0, 0, 0],
                    "points": 49,
                    "worst": 0
                  },
                  {
                    "rank": 9,
                    "number": 799,
                    "driver": "Philippe Marshall",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [15.5, 16.5, 15, 0, 0],
                    "points": 47,
                    "worst": 0
                  },
                  {
                    "rank": 10,
                    "number": 704,
                    "driver": "Felipe Nanne",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [0, 0, 0, 15.5, 15.5],
                    "points": 31,
                    "worst": 0
                  }
                ]
              }
            ]
          },
          {
            title: 'MINI ROK',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    "rank": 1,
                    "number": 517,
                    "driver": "Sofia Calderon",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [42.5, 42.5, 35.5, 32, 20],
                    "points": 152.5,
                    "worst": 20
                  },
                  {
                    "rank": 2,
                    "number": 516,
                    "driver": "Luciano Dajles",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [34, 28, 33.5, 42.5, 23.5],
                    "points": 138,
                    "worst": 23.5
                  },
                  {
                    "rank": 3,
                    "number": 575,
                    "driver": "Rafael Cañas",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [10, 32, 29, 5.5, 34],
                    "points": 100.5,
                    "worst": 10
                  },
                  {
                    "rank": 4,
                    "number": 521,
                    "driver": "Saúl Céspedes",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [27, 21.5, 18.5, 18.5, 26.5],
                    "points": 93.5,
                    "worst": 18.5
                  },
                  {
                    "rank": 5,
                    "number": 506,
                    "driver": "Samuel Chaverri",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [17.5, 18.5, 14, 25.5, 26.5],
                    "points": 88,
                    "worst": 14
                  },
                  {
                    "rank": 6,
                    "number": 510,
                    "driver": "Leandro Ramirez",
                    "team": "formula",
                    "country": "CR",
                    "scores": [19, 10, 16, 24, 24],
                    "points": 77,
                    "worst": 16
                  },
                  {
                    "rank": 7,
                    "number": 555,
                    "driver": "Emilio Wong",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [13.5, 16, 26, 16, 18.5],
                    "points": 76.5,
                    "worst": 13.5
                  },
                  {
                    "rank": 8,
                    "number": 528,
                    "driver": "Nico Salazar",
                    "team": "losprimos",
                    "country": "CR",
                    "scores": [17.5, 0, 13.5, 0, 0],
                    "points": 31,
                    "worst": 0
                  },
                  {
                    "rank": 9,
                    "number": 512,
                    "driver": "Sebastian Nuñez",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [13, 0, 0, 0, 0],
                    "points": 13,
                    "worst": 0
                  }
                ]
              }
            ]
          },
          {
            title: 'STARS OF TOMORROW',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: '',
                results: [
                  {
                    "rank": 1,
                    "number": 184,
                    "driver": "Abraham Murillo",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [34, 31, 29, 40, 38],
                    "points": 143,
                    "worst": 29
                  },
                  {
                    "rank": 2,
                    "number": 128,
                    "driver": "Emil Brautigam",
                    "team": "formula",
                    "country": "CR",
                    "scores": [42.5, 42.5, 41.5, 0, 0],
                    "points": 126.5,
                    "worst": 0
                  },
                  {
                    "rank": 3,
                    "number": 198,
                    "driver": "Santiago Navas",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [19.5, 21, 29.5, 36.5, 17.5],
                    "points": 104.5,
                    "worst": 19.5
                  },
                  {
                    "rank": 4,
                    "number": 107,
                    "driver": "Filippo Tucci",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [16.5, 18.5, 20, 25, 28.5],
                    "points": 92,
                    "worst": 16.5
                  },
                  {
                    "rank": 5,
                    "number": 108,
                    "driver": "Valentina Giraldo",
                    "team": "formula",
                    "country": "CR",
                    "scores": [17, 14, 15, 21.5, 25],
                    "points": 78.5,
                    "worst": 14
                  },
                  {
                    "rank": 6,
                    "number": 199,
                    "driver": "Mia Castro",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [16.5, 16.5, 17.5, 16.5, 19],
                    "points": 69.5,
                    "worst": 16.5
                  },
                  {
                    "rank": 7,
                    "number": 155,
                    "driver": "Carlos Andres Valverde",
                    "team": "formula",
                    "country": "CR",
                    "scores": [27, 8.5, 20.5, 7.5, 20.5],
                    "points": 75.5,
                    "worst": 8.5
                  },
                  {
                    "rank": 8,
                    "number": 111,
                    "driver": "Matthew Phillips",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [0, 26, 0, 17, 15.5],
                    "points": 58.5,
                    "worst": 0
                  }
                ]
              }
            ]
          },
          {
            title: 'TILLOTSON',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: 'TILLOTSON - HEAVY',
                results: [
                  {
                    "rank": 1,
                    "number": 912,
                    "driver": "Nicolas Otero",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [42.5, 38, 0, 17.5, 33],
                    "points": 131,
                    "worst": 0
                  },
                  {
                    "rank": 2,
                    "number": 901,
                    "driver": "Daniel Sequeira",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [34, 28.5, 15, 39, 33.5],
                    "points": 121.5,
                    "worst": 28.5
                  },
                  {
                    "rank": 3,
                    "number": 977,
                    "driver": "Javier Jose Mora",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [20.5, 32, 16.5, 26.5, 37],
                    "points": 112,
                    "worst": 20.5
                  },
                  {
                    "rank": 4,
                    "number": 916,
                    "driver": "Erick Brenes",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [23.5, 21.5, 30, 20.5, 18.5],
                    "points": 95.5,
                    "worst": 18.5
                  },
                  {
                    "rank": 5,
                    "number": 935,
                    "driver": "Alvaro Golfin",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 22.5, 34.5, 0, 0],
                    "points": 57,
                    "worst": 0
                  },
                  {
                    "rank": 6,
                    "number": 924,
                    "driver": "Henry Nanne",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [0, 0, 0, 27, 20.5],
                    "points": 47.5,
                    "worst": 0
                  },
                  {
                    "rank": 7,
                    "number": 919,
                    "driver": "Dieter Breisig",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [11, 0, 0, 0, 0],
                    "points": 11,
                    "worst": 0
                  }
                ]
              },
              {
                name: 'TILLOTSON - JUNIOR',
                results: [
                  {
                    "rank": 1,
                    "number": 945,
                    "driver": "Federico Rojas",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [3.5, 23, 42.5, 28.5, 42.5],
                    "points": 136.5,
                    "worst": 3.5
                  },
                  {
                    "rank": 2,
                    "number": 922,
                    "driver": "Tomas Arias",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [28, 39.5, 32, 31, 22.5],
                    "points": 130.5,
                    "worst": 22.5
                  },
                  {
                    "rank": 3,
                    "number": 956,
                    "driver": "Jian Luca Pastore",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [42.5, 31, 22.5, 24.5, 31],
                    "points": 129,
                    "worst": 22.5
                  },
                  {
                    "rank": 4,
                    "number": 984,
                    "driver": "Julian Serrano",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [19, 22, 22, 31.5, 18.5],
                    "points": 94.5,
                    "worst": 18.5
                  },
                  {
                    "rank": 5,
                    "number": 914,
                    "driver": "Martin Salom",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [31, 20.5, 3, 24, 28],
                    "points": 86,
                    "worst": 20.5
                  },
                  {
                    "rank": 6,
                    "number": 946,
                    "driver": "Alberto Soto",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [20.5, 19.5, 18.5, 0, 0],
                    "points": 58.5,
                    "worst": 0
                  },
                  {
                    "rank": 7,
                    "number": 908,
                    "driver": "Mayra Londoño",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [10.5, 10.5, 0, 19, 16],
                    "points": 56,
                    "worst": 0
                  },
                  {
                    "rank": 8,
                    "number": 904,
                    "driver": "Gabriel Valverde",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 14, 19, 0, 0],
                    "points": 33,
                    "worst": 0
                  },
                  {
                    "rank": 9,
                    "number": 909,
                    "driver": "Fabricio Montoya",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [14.5, 14.5, 0, 0, 0],
                    "points": 29,
                    "worst": 0
                  },
                  {
                    "rank": 10,
                    "number": 905,
                    "driver": "Valentina Chaverri",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [17.5, 0, 0, 0, 0],
                    "points": 17.5,
                    "worst": 0
                  },
                  {
                    "rank": 11,
                    "number": 913,
                    "driver": "Emma Mora",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [1, 12, 0, 0, 0],
                    "points": 13,
                    "worst": 0
                  },
                  {
                    "rank": 12,
                    "number": 918,
                    "driver": "Ariadna Calderon",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [13, 0, 0, 0, 0],
                    "points": 13,
                    "worst": 0
                  },
                  {
                    "rank": 13,
                    "number": 972,
                    "driver": "Luciana Aguilar",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [11, 0, 0, 0, 0],
                    "points": 11,
                    "worst": 0
                  }
                ]
              },
              {
                name: 'TILLOTSON - SENIOR',
                results: [
                  {
                    "rank": 1,
                    "number": 921,
                    "driver": "Manrique Valverde",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [42.5, 34.5, 42.5, 42.5, 38],
                    "points": 165.5,
                    "worst": 34.5
                  },
                  {
                    "rank": 2,
                    "number": 927,
                    "driver": "Eduardo Glenn",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [34, 22, 25, 29, 28.5],
                    "points": 116.5,
                    "worst": 22
                  },
                  {
                    "rank": 3,
                    "number": 971,
                    "driver": "Andres Valldeperas",
                    "team": "formula",
                    "country": "CR",
                    "scores": [11, 37.5, 29.5, 25.5, 29.5],
                    "points": 103.5,
                    "worst": 29.5
                  },
                  {
                    "rank": 4,
                    "number": 920,
                    "driver": "Mathias Hernandez",
                    "team": "formula",
                    "country": "CR",
                    "scores": [20.5, 13, 28, 25, 27],
                    "points": 93,
                    "worst": 20.5
                  },
                  {
                    "rank": 5,
                    "number": 906,
                    "driver": "Natalia Bräutigam",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [23.5, 20, 14.5, 18.5, 19.5],
                    "points": 81.5,
                    "worst": 14.5
                  },
                  {
                    "rank": 6,
                    "number": 929,
                    "driver": "Luca Albanese",
                    "team": "mhkarting",
                    "country": "CR",
                    "scores": [10, 19, 0, 14.5, 16],
                    "points": 59.5,
                    "worst": 0
                  },
                  {
                    "rank": 7,
                    "number": 999,
                    "driver": "Sebastian Mora",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [16, 22.5, 16, 0, 0],
                    "points": 54.5,
                    "worst": 0
                  },
                  {
                    "rank": 8,
                    "number": 957,
                    "driver": "Osvaldo Blanco",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [14.5, 0, 16.5, 0, 0],
                    "points": 31,
                    "worst": 0
                  },
                  {
                    "rank": 9,
                    "number": 910,
                    "driver": "Stefano Morice",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [13.5, 0, 0, 17, 0],
                    "points": 30.5,
                    "worst": 0
                  },
                  {
                    "rank": 10,
                    "number": 964,
                    "driver": "Santiago Alfaro",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 16.5, 0, 0, 0],
                    "points": 16.5,
                    "worst": 0
                  },
                  {
                    "rank": 11,
                    "number": 981,
                    "driver": "Gabriel Fabrega",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [15, 0, 0, 0, 0],
                    "points": 15,
                    "worst": 0
                  },
                  {
                    "rank": 12,
                    "number": 917,
                    "driver": "Julian Gutierrez",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 0, 14, 0, 0],
                    "points": 14,
                    "worst": 0
                  }
                ]
              }
            ]
          },
          {
            title: 'VLR',
            ageGroup: 'Age 8-12',
            details: [
              '8-12 years old',
              '950mm CIK/MSUK (Group 3) homologated chassis',
              'IAME 60cc Water Cooled Engine',
              'Vega tyres'
            ],
            img: 'https://kartshop.com/images/VLR1-2-p.webp',
            categories: [
              {
                name: 'VLR JUNIOR',
                results: [
                  {
                    "rank": 1,
                    "number": 236,
                    "driver": "Jose Alejandro Halphen",
                    "team": "fmv",
                    "country": "PA",
                    "scores": [17, 0, 18, 37.5, 42.5],
                    "points": 115,
                    "worst": 0
                  },
                  {
                    "rank": 2,
                    "number": 229,
                    "driver": "Luis Fernando Cedeño",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [40.5, 34, 17.5, 12, 16.5],
                    "points": 108.5,
                    "worst": 12
                  },
                  {
                    "rank": 3,
                    "number": 267,
                    "driver": "Lautaro Otero",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [27.5, 23.5, 12, 11, 34],
                    "points": 97,
                    "worst": 11
                  },
                  {
                    "rank": 4,
                    "number": 207,
                    "driver": "Anouk Valerio",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [22, 13.5, 25, 35, 9],
                    "points": 95.5,
                    "worst": 9
                  },
                  {
                    "rank": 5,
                    "number": 226,
                    "driver": "Gerardo Moreno",
                    "team": "losprimos",
                    "country": "CR",
                    "scores": [19, 23.5, 15.5, 23.5, 15.5],
                    "points": 81.5,
                    "worst": 15.5
                  },
                  {
                    "rank": 6,
                    "number": 277,
                    "driver": "Alessandro Carboni",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [12.5, 7.5, 11.5, 25, 14.5],
                    "points": 63.5,
                    "worst": 7.5
                  },
                  {
                    "rank": 7,
                    "number": 244,
                    "driver": "Fabian Acevedo",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [10, 30.5, 3, 10, 15],
                    "points": 58.5,
                    "worst": 10
                  },
                  {
                    "rank": 8,
                    "number": 218,
                    "driver": "Luciana Morales",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [15.5, 15.5, 7.5, 15.5, 12],
                    "points": 58.5,
                    "worst": 7.5
                  },
                  {
                    "rank": 9,
                    "number": 251,
                    "driver": "Daniel Gardella",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [6.5, 7.5, 10.5, 13.5, 21.5],
                    "points": 53,
                    "worst": 6.5
                  },
                  {
                    "rank": 10,
                    "number": 217,
                    "driver": "Samuel Castro",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [3, 15, 13.5, 12, 11],
                    "points": 51.5,
                    "worst": 3
                  },
                  {
                    "rank": 11,
                    "number": 235,
                    "driver": "Andres Dumith",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [21.5, 10, 20, 0, 0],
                    "points": 51.5,
                    "worst": 0
                  },
                  {
                    "rank": 12,
                    "number": 294,
                    "driver": "Francesca Morice",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [4.5, 10, 19, 5.5, 11],
                    "points": 45.5,
                    "worst": 4.5
                  },
                  {
                    "rank": 13,
                    "number": 220,
                    "driver": "Benjamin Beckley",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [14, 21, 9.5, 0, 0],
                    "points": 44.5,
                    "worst": 0
                  },
                  {
                    "rank": 14,
                    "number": 223,
                    "driver": "Diego Ardiles",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 0, 38.5, 0, 0],
                    "points": 38.5,
                    "worst": 0
                  },
                  {
                    "rank": 15,
                    "number": 255,
                    "driver": "Julian Regueyra",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 0, 7.5, 18.5, 12.5],
                    "points": 38.5,
                    "worst": 0
                  },
                  {
                    "rank": 16,
                    "number": 222,
                    "driver": "Sebastian Delgado",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [10.5, 4.5, 4, 5.5, 8],
                    "points": 28.5,
                    "worst": 4
                  },
                  {
                    "rank": 17,
                    "number": 201,
                    "driver": "Alberto Rojas Segura",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [0, 7, 5.5, 7, 9.5],
                    "points": 29,
                    "worst": 0
                  },
                  {
                    "rank": 18,
                    "number": 272,
                    "driver": "Luis Pedro Barrientos Jr",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [11, 11, 0, 0, 0],
                    "points": 22,
                    "worst": 0
                  }
                ]
              },
              {
                name: 'VLR MASTER',
                results: [
                  {
                    "rank": 1,
                    "number": 317,
                    "driver": "Andres Fonseca",
                    "team": "formula",
                    "country": "CR",
                    "scores": [39, 31, 42.5, 41.5, 25],
                    "points": 154,
                    "worst": 25
                  },
                  {
                    "rank": 2,
                    "number": 376,
                    "driver": "Peppe Di Falco",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [0, 40.5, 32, 31, 20],
                    "points": 123.5,
                    "worst": 0
                  },
                  {
                    "rank": 3,
                    "number": 365,
                    "driver": "David Gardella Sr",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [6, 27.5, 26, 31, 37.5],
                    "points": 122,
                    "worst": 6
                  },
                  {
                    "rank": 4,
                    "number": 396,
                    "driver": "Luis Alvarado",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [23.5, 17.5, 21.5, 21.5, 26],
                    "points": 92.5,
                    "worst": 17.5
                  },
                  {
                    "rank": 5,
                    "number": 327,
                    "driver": "Tim Vivian",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [37.5, 15, 0, 0, 0],
                    "points": 52.5,
                    "worst": 0
                  },
                  {
                    "rank": 6,
                    "number": 325,
                    "driver": "Paulo Sequeira",
                    "team": "losprimos",
                    "country": "CR",
                    "scores": [11, 22, 19.5, 0, 0],
                    "points": 52.5,
                    "worst": 0
                  },
                  {
                    "rank": 7,
                    "number": 324,
                    "driver": "Henry Nanne",
                    "team": "valerio",
                    "country": "CR",
                    "scores": [19.5, 15, 0, 0, 0],
                    "points": 34.5,
                    "worst": 0
                  },
                  {
                    "rank": 8,
                    "number": 328,
                    "driver": "Adrian Salazar",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [17.5, 0, 0, 0, 0],
                    "points": 17.5,
                    "worst": 0
                  },
                  {
                    "rank": 9,
                    "number": 326,
                    "driver": "Gerardo Moreno",
                    "team": "losprimos",
                    "country": "CR",
                    "scores": [0, 1, 0, 0, 0],
                    "points": 1,
                    "worst": 0
                  },
                  {
                    "rank": 10,
                    "number": 319,
                    "driver": "Lineth Valerio",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [1, 0, 0, 0, 0],
                    "points": 1,
                    "worst": 0
                  }
                ]
              },
              {
                name: 'VLR SENIOR',
                results: [
                  {
                    "rank": 1,
                    "number": 305,
                    "driver": "Bernal Valverde",
                    "team": "fmv",
                    "country": "CR",
                    "scores": [42.5, 42.5, 37.5, 42.5, 0],
                    "points": 122.5,
                    "worst": 42.5
                  },
                  {
                    "rank": 2,
                    "number": 316,
                    "driver": "Charlie Fonseca",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [31, 27, 31, 23.5, 28.5],
                    "points": 117.5,
                    "worst": 23.5
                  },
                  {
                    "rank": 3,
                    "number": 315,
                    "driver": "Luis Felipe Aguilar",
                    "team": "formula",
                    "country": "CR",
                    "scores": [22.5, 21, 17.5, 34, 38],
                    "points": 115.5,
                    "worst": 17.5
                  },
                  {
                    "rank": 4,
                    "number": 398,
                    "driver": "Isabella Valldeperas",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [24, 17, 0, 21, 28.5],
                    "points": 90.5,
                    "worst": 0
                  },
                  {
                    "rank": 5,
                    "number": 302,
                    "driver": "Andres Ardiles",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [13.5, 27.5, 19.5, 21.5, 14.5],
                    "points": 83,
                    "worst": 13.5
                  },
                  {
                    "rank": 6,
                    "number": 345,
                    "driver": "Luciano Sosto",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [10, 17.5, 20, 16, 19],
                    "points": 72.5,
                    "worst": 10
                  },
                  {
                    "rank": 7,
                    "number": 384,
                    "driver": "Sebastian Arce",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [9.5, 11.5, 0, 10, 28],
                    "points": 59,
                    "worst": 0
                  },
                  {
                    "rank": 8,
                    "number": 344,
                    "driver": "Augusto Acevedo",
                    "team": "fsa",
                    "country": "CR",
                    "scores": [12, 14.5, 12.5, 13.5, 11.5],
                    "points": 52.5,
                    "worst": 11.5
                  },
                  {
                    "rank": 9,
                    "number": 309,
                    "driver": "Franco Segnini",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [9, 11, 16, 10.5, 14],
                    "points": 51.5,
                    "worst": 9
                  },
                  {
                    "rank": 10,
                    "number": 310,
                    "driver": "David Gardella",
                    "team": "advanced",
                    "country": "CR",
                    "scores": [16.5, 13, 13, 8, 12],
                    "points": 50.5,
                    "worst": 12
                  },
                  {
                    "rank": 11,
                    "number": 323,
                    "driver": "Diego Ardiles",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 0, 26.5, 0, 0],
                    "points": 26.5,
                    "worst": 0
                  },
                  {
                    "rank": 12,
                    "number": 303,
                    "driver": "Yariela Chaves",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [0, 0, 0, 12, 13.5],
                    "points": 25.5,
                    "worst": 0
                  },
                  {
                    "rank": 13,
                    "number": 307,
                    "driver": "Frederik Lund",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [20, 0, 0, 0, 0],
                    "points": 20,
                    "worst": 0
                  },
                  {
                    "rank": 14,
                    "number": 304,
                    "driver": "Gabriel Kawer",
                    "team": "unknown",
                    "country": "CR",
                    "scores": [6, 10, 0, 0, 0],
                    "points": 16,
                    "worst": 0
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}

export const mockPilots = [
  // ADVANCED KARTING
  { name: "David Gardella Arias", kartNumber: 365, categories: ["VLR 100 MASTER"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Luciano Sosto", kartNumber: 345, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Erick Mauricio Brenes Picado", kartNumber: 916, categories: ["TILLOTSON Heavy"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Emilio Wong Bustamante", kartNumber: 555, categories: ["MINI ROK"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Enzo Formal Martinez", kartNumber: 737, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Theo Stefan Grunwedl U.", kartNumber: 198, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Isabella Hernández Camacho", kartNumber: 127, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Alberto Rojas Segura", kartNumber: 201, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Alessandro Carboni Navarro", kartNumber: 277, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Franco Segnini", kartNumber: 309, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "David Gardella Santamaria", kartNumber: 310, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Felipe Hernandez González", kartNumber: 991, categories: ["TILLOTSON Senior"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },
  { name: "Santiago Navas Castro", kartNumber: 998, categories: ["TILLOTSON Junior"], biography: "", country: "CR", teamName: "ADVANCED KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "advanced" },

  // BABYLISS PRO - MMR
  { name: "Paulo Andres Sequeira Moreno", kartNumber: 325, categories: ["VLR 100 MASTER"], biography: "", country: "CR", teamName: "BABYLISS PRO - MMR", profileUrl: "https://placehold.co/300x400", teamLogo: "losprimos" },
  { name: "Antonio Quesada Moreno", kartNumber: 18, categories: ["KID KART"], biography: "", country: "CR", teamName: "BABYLISS PRO - MMR", profileUrl: "https://placehold.co/300x400", teamLogo: "losprimos" },
  { name: "Daniel Sequeira Moreno", kartNumber: 901, categories: ["TILLOTSON Senior"], biography: "", country: "CR", teamName: "BABYLISS PRO - MMR", profileUrl: "https://placehold.co/300x400", teamLogo: "losprimos" },
  { name: "Fede Sequeira Moreno", kartNumber: 1, categories: ["KID KART"], biography: "", country: "CR", teamName: "BABYLISS PRO - MMR", profileUrl: "https://placehold.co/300x400", teamLogo: "losprimos" },
  { name: "Gerardo Moreno Riboldi", kartNumber: 226, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "BABYLISS PRO - MMR", profileUrl: "https://placehold.co/300x400", teamLogo: "losprimos" },
  { name: "Camila Moreno Riboldi", kartNumber: 717, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "BABYLISS PRO - MMR", profileUrl: "https://placehold.co/300x400", teamLogo: "losprimos" },

  // FMV
  { name: "Omar Rojas Wolff", kartNumber: 10, categories: ["KID KART"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "José A. Halphen", kartNumber: 236, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Felipe Vargas", kartNumber: 611, categories: ["ROK SHIFTER"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "RAFAEL FABREGA", kartNumber: 905, categories: ["TILLOTSON Senior"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Saul cespedes jimenez", kartNumber: 521, categories: ["MINI ROK"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Ricardo Vargas", kartNumber: 612, categories: ["ROK SHIFTER"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Osvaldo Blanco", kartNumber: 957, categories: ["TILLOTSON Senior"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Benjamin Beckley", kartNumber: 220, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Bernal Valverde", kartNumber: 305, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  { name: "Sofía Calderón Vargas", kartNumber: 517, categories: ["MINI ROK"], biography: "", country: "CR", teamName: "FMV", profileUrl: "https://placehold.co/300x400", teamLogo: "fmv" },
  

  { name: "Emilio Bolaños Mora", kartNumber: 105, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "Fik Sport Academy", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Stefano Morice", kartNumber: 910, categories: ["TILLOTSON SENIOR"], biography: "", country: "CR", teamName: "Fik Sport Academy", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Jaden Spielman", kartNumber: 141, categories: ["STARS of TOMORROW", "MINI ROK"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Fabian Acevedo", kartNumber: 244, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "Fik Sport Academy", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "César Redondo Arrieta", kartNumber: 969, categories: ["TILLOTSON Heavy"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Charlie Fonseca", kartNumber: 316, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Samuel Castro", kartNumber: 217, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Augusto Acevedo Urbina", kartNumber: 344, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Jaden Spielman", kartNumber: 541, categories: ["MINI ROK"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Francesca Morice", kartNumber: 294, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Luana Daniela Dorado Yumbato", kartNumber: 152, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },
  { name: "Diego Mejía Rojas", kartNumber: 247, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "FIK SPORT ACADEMY", profileUrl: "https://placehold.co/300x400", teamLogo: "fsa" },

  
  { name: "Damian Ramirez", kartNumber: 5, categories: ["KID KART"], biography: "", country: "CR", teamName: "FORMULA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Carlos Andrés Valverde Blanco", kartNumber: 155, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "FORMULA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Leandro Ramirez", kartNumber: 510, categories: ["MINI ROK", "MICRO ROK"], biography: "", country: "CR", teamName: "FORMULA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Valentina Giraldo Chavarría", kartNumber: 197, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "FORMULA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Julian Lahmann", kartNumber: 124, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Luis Felipe Aguilar", kartNumber: 315, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Andres Fonseca", kartNumber: 317, categories: ["VLR 100 MASTER"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Pablo Bolaños", kartNumber: 319, categories: ["VLR 100 MASTER"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Martin Salom", kartNumber: 342, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Andrés Valldeperas Calvo", kartNumber: 671, categories: ["ROK SHIFTER"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Mathias Hernández Arce", kartNumber: 920, categories: ["TILLOTSON Senior"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },
  { name: "Emil Bräutigam Arguello", kartNumber: 928, categories: ["TILLOTSON Junior"], biography: "", country: "CR", teamName: "FORMULKA KART", profileUrl: "https://placehold.co/300x400", teamLogo: "formula" },


  { name: "Mauricio Hernandez", kartNumber: 311, categories: ["VLR 100 SENIOR"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Samuel Chaverri", kartNumber: 506, categories: ["MINI ROK"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Samuel Chaverri", kartNumber: 701, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "JIAN LUCA PASTORE", kartNumber: 956, categories: ["TILLOTSON Junior"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Mauricio Hernandez", kartNumber: 617, categories: ["ROK SHIFTER"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Luciano Albanese Villalobos", kartNumber: 708, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Matthew Phillips", kartNumber: 119, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Luciano Albanese Villalobos", kartNumber: 508, categories: ["MINI ROK"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Luca Albanese Villalobos", kartNumber: 929, categories: ["TILLOTSON Senior"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },
  { name: "Javier Mora Zuñiga", kartNumber: 977, categories: ["TILLOTSON Heavy"], biography: "", country: "CR", teamName: "MH KARTING", profileUrl: "https://placehold.co/300x400", teamLogo: "mhkarting" },


  { name: "Henry Nanne", kartNumber: 924, categories: ["TILLOTSON Heavy"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Chayton Rodríguez Farías", kartNumber: 711, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Tomás Arias", kartNumber: 922, categories: ["TILLOTSON Junior"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Timothy Vivian", kartNumber: 327, categories: ["VLR 100 MASTER"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Marcelo Jesus Piñango Graterol", kartNumber: 107, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Felipe Nanne Baltodano", kartNumber: 704, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Makya Rodriguez Farias", kartNumber: 712, categories: ["MICRO ROK"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Anouk Valerio Gonzalez", kartNumber: 207, categories: ["VLR 100 JUNIOR"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Fabian Vargas Barboza", kartNumber: 108, categories: ["STARS of TOMORROW"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },
  { name: "Luis Alvarado Vargas", kartNumber: 396, categories: ["VLR 100 MASTER"], biography: "", country: "CR", teamName: "VALERIO RACING SYSTEM", profileUrl: "https://placehold.co/300x400", teamLogo: "valerio" },

];

