import { ProgramTemplate } from './types';

export const softwareEngineering: ProgramTemplate = {
  name: 'Software Engineering, 180 HP',
  courses: [
    // År 1
    { name: 'Grundläggande mjukvaruutveckling', code: 'PA1489', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1670', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Diskret matematik och algoritmer', code: 'MA1507', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Objektorienterad programmering i C++', code: 'DV1627', hp: 7.5, year: 1, semester: 'HT' },
    { name: 'Programvarudesign', code: 'PA1458', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Databasteknik', code: 'DV1703', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Algoritmer och datastrukturer', code: 'DV1662', hp: 7.5, year: 1, semester: 'VT' },
    { name: 'Nätverksbaserade system', code: 'ET1524', hp: 7.5, year: 1, semester: 'VT' },
    // År 2
    { name: 'Introduktion till kodningsteori och kryptering', code: 'MA1508', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Individuellt programvaruprojekt', code: 'PA1414', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Operativsystem', code: 'DV1698', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Datorteknik', code: 'DV1613', hp: 7.5, year: 2, semester: 'HT' },
    { name: 'Programvaruprojekt i grupp', code: 'PA1416', hp: 15, year: 2, semester: 'VT' },
    { name: 'Tillämpad generativ AI', code: 'DV1729', hp: 7.5, year: 2, semester: 'VT' },
    { name: 'Grundläggande systemverifiering', code: 'PA1417', hp: 7.5, year: 2, semester: 'VT' },
    // År 3
    { name: 'Forskningsmetodik i datavetenskaper', code: 'PA1478', hp: 7.5, year: 3, semester: 'HT' },
    { name: 'Kandidatarbete i Programvaruteknik', code: 'PA1445', hp: 15, year: 3, semester: 'VT' },
    { name: 'Avancerat programvaruprojekt i grupp', code: 'PA1449', hp: 15, year: 3, semester: 'VT' },
  ],
};
