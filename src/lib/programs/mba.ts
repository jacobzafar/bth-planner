import { ProgramTemplate } from './types';

export const mbaProgrammet: ProgramTemplate = {
  name: 'MBA-programmet, 60 HP',
  courses: [
    // År 1
    { name: 'Perspektiv på ledarskap', code: 'IY2630', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Finansiering och investering', code: 'IY2633', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Mikroekonomi för beslutsfattare', code: 'IY2593', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Strategi och styrning', code: 'IY2610', hp: 7.5, year: 1, semester: 'VT' },
    // År 2
    { name: 'Ekonomisk analys av teknologi och innovation', code: 'IY2611', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Forskningsmetodik i industriell ekonomi', code: 'IY2596', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Magisterarbete MBA', code: 'IY2656', hp: 15, year: 2, semester: 'VT' },
  ],
};
