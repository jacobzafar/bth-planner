import { ProgramTemplate } from './types';

export const magisterSoftwareEng: ProgramTemplate = {
  name: 'Magisterprogram i Software Engineering, 60 HP',
  courses: [
    // År 1
    { name: 'Adaptiv Lean Programvarutestning', code: 'PA2579', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Produkthantering och kravhantering för digitala miljöer', code: 'PA2578', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Agil och Lean utveckling av mjukvaruintensiva produkter', code: 'PA2580', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Tillämpad Cloud Computing och Big Data', code: 'PA2577', hp: 7.5, year: 1, semester: 'HT' },
    // År 2
    { name: 'Introduktion till säkerhet för mjukvaruutveckling', code: 'PA2585', hp: 6, year: 2, semester: 'VT' },
    { name: 'Maskininlärningsteknik', code: 'PA2595', hp: 6, year: 2, semester: 'VT' },
    { name: 'Forskningsmetodik och magisterarbete i programvaruteknik', code: 'PA2592', hp: 18, year: 2, semester: 'VT' },
  ],
};

export const magisterHallbarhet: ProgramTemplate = {
  name: 'Magisterprogram i strategiskt ledarskap för hållbarhet, 60 HP',
  courses: [
    { name: 'Ledarskap i komplexitet', code: 'SL2576', hp: 10, year: 1, semester: 'HT' },
    { name: 'Strategisk hållbar utveckling', code: 'SL2533', hp: 12.5, year: 1, semester: 'HT' },
    { name: 'Strategisk planering för hållbarhet', code: 'SL2550', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Forskningsmetodik för hållbarhet', code: 'SL2537', hp: 5, year: 1, semester: 'HT' },
    { name: 'Innovation för hållbarhet', code: 'SL2540', hp: 5, year: 1, semester: 'HT' },
    { name: 'Magisterarbete i strategiskt ledarskap för hållbarhet', code: 'SL2538', hp: 20, year: 1, semester: 'VT' },
  ],
};
