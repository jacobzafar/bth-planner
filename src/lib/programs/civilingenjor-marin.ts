import { ProgramTemplate } from './types';

export const civilingenjorMarin: ProgramTemplate = {
  name: 'Civilingenjör i marin teknik, 300 HP',
  courses: [
    // År 1
    { name: 'Linjär algebra', code: 'MA1498', hp: 6, year: 1, semester: 'HT' },
    { name: 'Teknisk introduktionskurs i maskinteknik', code: 'MT1567', hp: 6, year: 1, semester: 'HT' },
    { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'HT' },
    { name: 'Datorstöd för ingenjörsarbete 1', code: 'MT1549', hp: 8, year: 1, semester: 'HT' },
    { name: 'Mekanik', code: 'FY1435', hp: 6, year: 1, semester: 'VT' },
    { name: 'Envariabelanalys 1: funktioner och differentialkalkyl', code: 'MA1499', hp: 6, year: 1, semester: 'VT' },
    { name: 'MATLAB med tillämpningar inom matematik och teknik', code: 'ET1563', hp: 4, year: 1, semester: 'VT' },
    { name: 'Envariabelanalys 2: differentialekvationer och integralkalkyl', code: 'MA1500', hp: 6, year: 1, semester: 'VT' },
    { name: 'Nautisk introduktion', code: 'MT1557', hp: 6, year: 1, semester: 'VT' },
    { name: 'Hållfasthetslära, grundkurs', code: 'MT1565', hp: 6, year: 1, semester: 'VT' },
    // År 2
    { name: 'Mekanik: dynamik', code: 'MT1573', hp: 6, year: 2, semester: 'HT' },
    { name: 'Flervariabelanalys', code: 'MA1501', hp: 6, year: 2, semester: 'HT' },
    { name: 'Etik och hållbarhet för maskinteknik', code: 'SL1419', hp: 6, year: 2, semester: 'HT' },
    { name: 'Vågfysik', code: 'FY1437', hp: 6, year: 2, semester: 'VT' },
    { name: 'Teknikutveckling; marin teknik, hållbarhet och samhällsutveckling', code: 'MT1580', hp: 6, year: 2, semester: 'VT' },
    { name: 'Marinteknisk projektkurs med produktutveckling och projektledning', code: 'ET1559', hp: 8, year: 2, semester: 'VT' },
    { name: 'Vektoranalys', code: 'MA1503', hp: 4, year: 2, semester: 'HT' },
    { name: 'Materiallära', code: 'MT1572', hp: 6, year: 2, semester: 'HT' },
    { name: 'Termodynamik', code: 'FY1438', hp: 6, year: 2, semester: 'VT' },
    { name: 'Ellära, grundkurs', code: 'ET1538', hp: 6, year: 2, semester: 'VT' },
    // År 3
    { name: 'Strömningslära', code: 'MT1563', hp: 6, year: 3, semester: 'HT' },
    { name: 'Oceanografi', code: 'MT1562', hp: 6, year: 3, semester: 'HT' },
    { name: 'Elektronik med tillämpningar inom mätteknik', code: 'ET1535', hp: 6, year: 3, semester: 'HT' },
    { name: 'Matematisk statistik', code: 'MS1416', hp: 6, year: 3, semester: 'HT' },
    { name: 'Marin konstruktion', code: 'MT1561', hp: 6, year: 3, semester: 'VT' },
    { name: 'Transformteori', code: 'MA1506', hp: 6, year: 3, semester: 'VT' },
    { name: 'Kandidatarbete i teknik för marin teknik', code: 'TE1434', hp: 18, year: 3, semester: 'VT' },
    { name: 'Fartygstillsyn och marina regelverk', code: 'MT1560', hp: 6, year: 3, semester: 'VT' },
    // År 4
    { name: 'Reglerteknik, grundkurs', code: 'ET1561', hp: 6, year: 4, semester: 'HT' },
    { name: 'Signaler och system, grundkurs', code: 'ET1557', hp: 6, year: 4, semester: 'HT' },
    { name: 'Tillämpad maskininlärning', code: 'MT1575', hp: 6, year: 4, semester: 'HT' },
    { name: 'Signaler och system, fortsättningskurs', code: 'ET2626', hp: 6, year: 4, semester: 'VT' },
    { name: 'Marinteknisk projektkurs med industriell ekonomi och affärsplanering', code: 'ET2632', hp: 12, year: 4, semester: 'VT' },
    { name: 'Hydroakustik', code: 'FY2506', hp: 6, year: 4, semester: 'VT' },
    { name: 'Reglerteknik, fortsättningskurs', code: 'ET2630', hp: 6, year: 4, semester: 'VT' },
    // År 5
    { name: 'Undervattensteknik', code: 'MT2581', hp: 6, year: 5, semester: 'HT' },
    { name: 'Forskningsmetodik för ingenjörer', code: 'MT2585', hp: 6, year: 5, semester: 'HT' },
    { name: 'Sensorsystem', code: 'ET2628', hp: 6, year: 5, semester: 'HT' },
    { name: 'Mekatronik med robotik', code: 'ET2629', hp: 6, year: 5, semester: 'VT' },
    { name: 'Masterarbete i maskinteknik', code: 'MT2600', hp: 30, year: 5, semester: 'VT' },
  ],
};
