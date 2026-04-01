import { ProgramTemplate } from './types';

export const hogskoleingenjorSpelgrafik: ProgramTemplate = {
  name: 'Högskoleingenjör i teknisk spelgrafik, 180 HP',
  courses: [
    // År 1
    { name: 'Algebra och analys', code: 'MA1509', hp: 18, year: 1, semester: 'HT' },
    { name: 'Spelutveckling inom teknisk spelgrafik', code: 'DV1669', hp: 6, year: 1, semester: 'HT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'VT' },
    { name: 'Teknisk 3D-grafik', code: 'DV1635', hp: 6, year: 1, semester: 'VT' },
    { name: 'Prototyputveckling inom teknisk spelgrafik', code: 'DV1637', hp: 12, year: 1, semester: 'VT' },
    { name: 'Spelgrafik', code: 'DV1636', hp: 6, year: 1, semester: 'VT' },
    { name: 'Skripting för spelgrafik', code: 'DV1639', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Tillämpad spelgrafik', code: 'DV1733', hp: 14, year: 2, semester: 'HT' },
    { name: '3D-programmering i spelmotorer', code: 'DV1731', hp: 6, year: 2, semester: 'HT' },
    { name: 'Ledarskap och projektverksamhet', code: 'IY1460', hp: 4, year: 2, semester: 'VT' },
    { name: 'Matematisk statistik med programvara', code: 'MS1417', hp: 6, year: 2, semester: 'VT' },
    { name: 'Litet spelprojekt för teknisk spelgrafik', code: 'DV1646', hp: 10, year: 2, semester: 'VT' },
    { name: 'Fysik för teknisk spelgrafik', code: 'FY1434', hp: 6, year: 2, semester: 'VT' },
    { name: 'Specialeffekter i spel', code: 'DV1650', hp: 6, year: 2, semester: 'VT' },
    { name: 'Animationstekniker', code: 'DV1648', hp: 8, year: 2, semester: 'VT' },
    // År 3
    { name: 'Forskningsmetodik i datavetenskaper', code: 'PA1457', hp: 6, year: 3, semester: 'HT' },
    { name: 'Stort spelprojekt för teknisk spelgrafik', code: 'DV1653', hp: 24, year: 3, semester: 'HT' },
    { name: 'Pluginkonstruktion', code: 'DV1649', hp: 6, year: 3, semester: 'HT' },
    { name: 'Industriell ekonomi, översiktskurs', code: 'IY1458', hp: 6, year: 3, semester: 'VT' },
    { name: 'Examensarbete i datavetenskap för högskoleingenjörer', code: 'DV1583', hp: 18, year: 3, semester: 'VT' },
  ],
};
