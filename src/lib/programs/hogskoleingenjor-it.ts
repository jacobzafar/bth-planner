import { ProgramTemplate } from './types';

export const hogskoleingenjorIT: ProgramTemplate = {
  name: 'Högskoleingenjör i IT-säkerhet, 180 HP',
  courses: [
    // År 1
    { name: 'Datorsäkerhet och ingenjörsarbete', code: 'DV1671', hp: 6, year: 1, semester: 'HT' },
    { name: 'Algebra och analys', code: 'MA1509', hp: 18, year: 1, semester: 'HT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'HT' },
    { name: 'Programmering i C++', code: 'DV1626', hp: 6, year: 1, semester: 'VT' },
    { name: 'Datakommunikation och nätverksteknik', code: 'DV1685', hp: 6, year: 1, semester: 'VT' },
    { name: 'Digital etik och hållbar utveckling', code: 'PA1481', hp: 6, year: 1, semester: 'VT' },
    { name: 'Diskret matematik', code: 'MA1504', hp: 6, year: 1, semester: 'VT' },
    { name: 'Datastrukturer och algoritmer', code: 'DV1682', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Kryptologins grunder', code: 'MA1505', hp: 6, year: 2, semester: 'HT' },
    { name: 'Nätverkssäkerhet', code: 'DV1686', hp: 6, year: 2, semester: 'HT' },
    { name: 'Programvaruutveckling', code: 'PA1484', hp: 6, year: 2, semester: 'HT' },
    { name: 'Matematisk statistik med programvara', code: 'MS1417', hp: 6, year: 2, semester: 'HT' },
    { name: 'Datorteknik', code: 'DV1730', hp: 6, year: 2, semester: 'VT' },
    { name: 'Operativsystem', code: 'DV1697', hp: 6, year: 2, semester: 'VT' },
    { name: 'Industriell ekonomi, översiktskurs', code: 'IY1458', hp: 6, year: 2, semester: 'VT' },
    { name: 'Databasteknik', code: 'DV1663', hp: 6, year: 2, semester: 'VT' },
    // År 3
    { name: 'Intelligent dataanalys', code: 'DV1597', hp: 6, year: 3, semester: 'HT' },
    { name: 'Tillämpad cybersäkerhet', code: 'DV1732', hp: 6, year: 3, semester: 'HT' },
    { name: 'Programvarusäkerhet', code: 'DV2639', hp: 6, year: 3, semester: 'HT' },
    { name: 'Säkerhetsprojekt i grupp, inriktning systemutveckling', code: 'DV1512', hp: 8, year: 3, semester: 'HT' },
    { name: 'Forskningsmetodik i datavetenskaper', code: 'PA1457', hp: 6, year: 3, semester: 'VT' },
    { name: 'Ledarskap och projektverksamhet', code: 'IY1460', hp: 4, year: 3, semester: 'VT' },
    { name: 'Examensarbete i datavetenskap för högskoleingenjörer', code: 'DV1583', hp: 18, year: 3, semester: 'VT' },
  ],
};
