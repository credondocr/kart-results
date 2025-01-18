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
          team: 'formula',
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
          team: 'advanced',
          country: 'CR',
          scores: [ 38, 0, 0, 0, 0, 0 ],
          points: 38,
          worst: 0
        }
      ]
    }
  ]
}