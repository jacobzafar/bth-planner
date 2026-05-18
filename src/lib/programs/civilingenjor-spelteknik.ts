import { ProgramTemplate } from './types';

export const civilingenjorSpelteknik: ProgramTemplate = {
  name: 'Civilingenjör i spelteknik, 300 HP',
  courses: [
    // År 1
    { name: 'Linjär algebra', code: 'MA1498', hp: 6, year: 1, semester: 'HT' },
    { name: 'Spelutveckling och ingenjörsarbete', code: 'DV1691', hp: 6, year: 1, semester: 'HT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'HT' },
    { name: 'Industriell ekonomi, översiktskurs', code: 'IY1458', hp: 6, year: 1, semester: 'HT' },
    { name: 'Envariabelanalys 1: funktioner och differentialkalkyl', code: 'MA1499', hp: 6, year: 1, semester: 'HT' },
    { name: 'Envariabelanalys 2: differentialekvationer och integralkalkyl', code: 'MA1500', hp: 6, year: 1, semester: 'HT' },
    { name: 'Programmering i C++', code: 'DV1626', hp: 6, year: 1, semester: 'VT' },
    { name: 'Digital etik och hållbar utveckling', code: 'PA1481', hp: 6, year: 1, semester: 'VT' },
    { name: 'Diskret matematik', code: 'MA1504', hp: 6, year: 1, semester: 'VT' },
    { name: 'Datastrukturer och algoritmer', code: 'DV1682', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Flervariabelanalys', code: 'MA1501', hp: 6, year: 2, semester: 'HT' },
    { name: 'Programvaruutveckling', code: 'PA1484', hp: 6, year: 2, semester: 'HT' },
    { name: 'Kraft och energi', code: 'FY1436', hp: 6, year: 2, semester: 'HT' },
    { name: '3D-programmering I', code: 'DV1692', hp: 6, year: 2, semester: 'HT' },
    { name: 'Datorteknik', code: 'DV1730', hp: 6, year: 2, semester: 'HT' },
    { name: 'Operativsystem', code: 'DV1697', hp: 6, year: 2, semester: 'VT' },
    { name: '3D-programmering II', code: 'DV1693', hp: 12, year: 2, semester: 'VT' },
    { name: 'Objektorienterad design', code: 'PA1472', hp: 6, year: 2, semester: 'VT' },
    // År 3
    { name: 'Fysik för spelteknik', code: 'FY1432', hp: 6, year: 3, semester: 'HT' },
    { name: 'Litet spelprojekt', code: 'DV1694', hp: 12, year: 3, semester: 'HT' },
    { name: 'Skripting och andra språk', code: 'DV1633', hp: 6, year: 3, semester: 'HT' },
    { name: 'Matematisk statistik', code: 'MS1416', hp: 6, year: 3, semester: 'HT' },
    { name: 'Multiprocessorprogrammering', code: 'DV2606', hp: 6, year: 3, semester: 'VT' },
    { name: 'Kandidatarbete i teknik för spelteknik', code: 'TE1437', hp: 18, year: 3, semester: 'VT' },
    // År 4
    { name: 'Forskningsmetodik i datavetenskap', code: 'DV2654', hp: 6, year: 4, semester: 'HT' },
    { name: 'Spelmotorarkitekturer', code: 'DV2651', hp: 6, year: 4, semester: 'HT' },
    { name: 'Tillämpad artificiell intelligens', code: 'DV2659', hp: 6, year: 4, semester: 'HT' },
    { name: '3D-programmering III', code: 'DV2652', hp: 6, year: 4, semester: 'VT' },
    { name: 'Spelteknik för webben', code: 'DV1695', hp: 6, year: 4, semester: 'VT' },
    { name: 'Teknisk 3D-grafik', code: 'DV1635', hp: 6, year: 4, semester: 'VT' },
    // År 5
    { name: 'Stort spelprojekt', code: 'DV2653', hp: 30, year: 5, semester: 'HT' },
    { name: 'Masterarbete i datavetenskap', code: 'DV2649', hp: 30, year: 5, semester: 'VT' },
  ],
};
