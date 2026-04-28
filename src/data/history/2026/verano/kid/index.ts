import { Class } from "@/data/types";

export const kid: Class = {
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
          number: 17,
          driver: 'Alessandro Calvosa',
          team: 'dr-racing',
          country: 'CR',
          // Totales por carrera: (R1+R2+R3) -> [41.5, 37.5]
          scores: [41.5, 37.5, 0, 0, 0],
          points: 79,
          worst: 0
        },
        {
          rank: 2,
          number: 8,
          driver: 'Mariano Quiros',
          team: 'fsa',
          country: 'CR',
          // Totales por carrera: [33, 39]
          scores: [33, 39, 0, 0, 0],
          points: 72,
          worst: 0
        },
        {
          rank: 3,
          number: 18,
          driver: 'Julian De Oliva',
          team: 'fmv',
          country: 'CR',
          // Totales por carrera: [29, 27]
          scores: [29, 27, 0, 0, 0],
          points: 56,
          worst: 0
        },
        {
          rank: 4,
          number: 9,
          driver: 'Fernan Montealegre',
          team: 'fsa',
          country: 'CR',
          // Totales por carrera: [0, 19.5]
          scores: [0, 19.5, 0, 0, 0],
          points: 19.5,
          worst: 0
        },
        {
          rank: 5,
          number: 77,
          driver: 'Ernesto Montealegre',
          team: 'fsa',
          country: 'CR',
          // Totales por carrera: [0, 19.5]
          scores: [0, 19.5, 0, 0, 0],
          points: 19.5,
          worst: 0
        }
      ]
    }
  ]
}

