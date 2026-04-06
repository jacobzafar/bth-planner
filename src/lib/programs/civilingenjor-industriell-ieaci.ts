import { ProgramTemplate } from './types';

// Sista antagning HT 2023 – programmet är fortfarande aktivt för antagna studenter
// Två inriktningar: Industriell mjukvaruutveckling (IMUV) och Maskinteknik och hållbar produktinnovation (MAS1)

const sharedCourses = [
  // År 1
  { name: 'Matematisk problemlösning', code: 'MA1486', hp: 4, year: 1, semester: 'HT' as const },
  { name: 'Teknisk introduktionskurs med ingenjörsmetodik', code: 'TE1421', hp: 8, year: 1, semester: 'HT' as const },
  { name: 'Grunderna i industriell ekonomi', code: 'IY1418', hp: 6, year: 1, semester: 'HT' as const },
  { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'HT' as const },
  { name: 'Linjär algebra 1', code: 'MA1448', hp: 6, year: 1, semester: 'HT' as const },
  { name: 'Tillämpad mikroekonomi och strategi', code: 'IY1417', hp: 6, year: 1, semester: 'VT' as const },
  { name: 'Analys 1', code: 'MA1444', hp: 6, year: 1, semester: 'VT' as const },
  { name: 'Fysik grundkurs', code: 'FY1431', hp: 6, year: 1, semester: 'VT' as const },
  { name: 'Företag och organisation', code: 'IY1439', hp: 6, year: 1, semester: 'VT' as const },
  { name: 'Analys 2', code: 'MA1494', hp: 6, year: 1, semester: 'VT' as const, prerequisites: ['MA1444'] },
  // År 2
  { name: 'Grundkurs i hållbar utveckling', code: 'SL1418', hp: 6, year: 2, semester: 'HT' as const },
  { name: 'Företaget i en global ekonomi', code: 'IY1421', hp: 6, year: 2, semester: 'HT' as const, prerequisites: ['IY1418'] },
  { name: 'Diskret matematik', code: 'MA1446', hp: 6, year: 2, semester: 'HT' as const },
  { name: 'Fysik för ingenjörer 2', code: 'FY1423', hp: 6, year: 2, semester: 'HT' as const, prerequisites: ['FY1431'] },
  { name: 'Flervariabelanalys', code: 'MA1447', hp: 6, year: 2, semester: 'HT' as const, prerequisites: ['MA1444', 'MA1494'] },
  { name: 'Programvaruutveckling', code: 'PA1484', hp: 6, year: 2, semester: 'VT' as const, prerequisites: ['DV1574'] },
  { name: 'Fysik för ingenjörer 3', code: 'FY1424', hp: 6, year: 2, semester: 'VT' as const, prerequisites: ['FY1423'] },
  { name: 'Industriell marknadsföring - teori och praktik', code: 'IY1419', hp: 6, year: 2, semester: 'VT' as const, prerequisites: ['IY1418'] },
  { name: 'Introduktion till databaser', code: 'DV1664', hp: 6, year: 2, semester: 'VT' as const, prerequisites: ['DV1574'] },
  { name: 'Datorstöd för ingenjörsarbete', code: 'MT1463', hp: 6, year: 2, semester: 'VT' as const },
];

export const civilingenjorIndustriellIMUV: ProgramTemplate = {
  name: 'Civilingenjör i industriell ekonomi – Industriell mjukvaruutveckling, 300 HP (avvecklat, sista antagning HT 2023)',
  courses: [
    ...sharedCourses,
    // År 3 – IMUV
    { name: 'Matematisk statistik', code: 'MS1416', hp: 6, year: 3, semester: 'HT' },
    { name: 'Innovativ och hållbar produktutveckling 1', code: 'MT1556', hp: 6, year: 3, semester: 'HT' },
    { name: 'Programmering i Python, fortsättningskurs', code: 'DV1582', hp: 6, year: 3, semester: 'HT', prerequisites: ['DV1574'] },
    { name: 'Ledarskap och organisation i kunskapsintensiva miljöer', code: 'IY1428', hp: 6, year: 3, semester: 'HT' },
    { name: 'Ekonometri', code: 'IY1420', hp: 6, year: 3, semester: 'HT', prerequisites: ['MS1416'] },
    { name: 'Objektorienterad design', code: 'PA1472', hp: 6, year: 3, semester: 'VT', prerequisites: ['PA1484'] },
    { name: 'Programvaruintensiv produktutveckling', code: 'PA2576', hp: 12, year: 3, semester: 'VT', prerequisites: ['PA1484'] },
    { name: 'Finansiell ekonomi', code: 'IY1422', hp: 6, year: 3, semester: 'VT', prerequisites: ['IY1417'] },
    { name: 'Datastrukturer och algoritmer', code: 'DV1682', hp: 6, year: 3, semester: 'VT', prerequisites: ['DV1582'] },
    // År 4 – IMUV
    { name: 'Produktionsekonomi', code: 'IY2595', hp: 7.5, year: 4, semester: 'HT' },
    { name: 'Företagsanalys', code: 'IY2583', hp: 7.5, year: 4, semester: 'HT', prerequisites: ['IY1422'] },
    { name: 'Maskininlärning', code: 'DV2626', hp: 7.5, year: 4, semester: 'HT', prerequisites: ['DV1582', 'MS1416'] },
    { name: 'Projektkurs i industriell ekonomi och projektledning', code: 'IY2585', hp: 7.5, year: 4, semester: 'VT' },
    { name: 'Programvaruprojekt i team', code: 'PA2539', hp: 15, year: 4, semester: 'VT', prerequisites: ['PA2576'] },
    // År 5 – IMUV
    { name: 'Ekonomisk analys av teknikskiften', code: 'IY2655', hp: 7.5, year: 5, semester: 'HT' },
    { name: 'Forskningsmetod och design', code: 'IY2654', hp: 7.5, year: 5, semester: 'HT' },
    { name: 'Examensarbete för civilingenjörer', code: 'TE2502', hp: 30, year: 5, semester: 'VT', prerequisites: ['IY2654'] },
  ],
};

export const civilingenjorIndustriellMAS1: ProgramTemplate = {
  name: 'Civilingenjör i industriell ekonomi – Maskinteknik och hållbar produktinnovation, 300 HP (avvecklat, sista antagning HT 2023)',
  courses: [
    ...sharedCourses,
    // År 3 – MAS1
    { name: 'Matematisk statistik', code: 'MS1416', hp: 6, year: 3, semester: 'HT' },
    { name: 'Hållfasthetslära grundkurs', code: 'MT1506', hp: 6, year: 3, semester: 'HT' },
    { name: 'Innovativ och hållbar produktutveckling 1', code: 'MT1556', hp: 6, year: 3, semester: 'HT' },
    { name: 'Ledarskap och organisation i kunskapsintensiva miljöer', code: 'IY1428', hp: 6, year: 3, semester: 'HT' },
    { name: 'Ekonometri', code: 'IY1420', hp: 6, year: 3, semester: 'HT', prerequisites: ['MS1416'] },
    { name: 'Materiallära', code: 'MT1572', hp: 6, year: 3, semester: 'VT' },
    { name: 'Termodynamik', code: 'FY1438', hp: 6, year: 3, semester: 'VT', prerequisites: ['FY1424'] },
    { name: 'Finansiell ekonomi', code: 'IY1422', hp: 6, year: 3, semester: 'VT', prerequisites: ['IY1417'] },
    { name: 'Hållbara energisystem - grundkurs', code: 'SL2542', hp: 6, year: 3, semester: 'VT' },
    { name: 'Tillverkningsteknik', code: 'MT1568', hp: 6, year: 3, semester: 'VT' },
    // År 4 – MAS1
    { name: 'Produktionsekonomi', code: 'IY2595', hp: 7.5, year: 4, semester: 'HT' },
    { name: 'Företagsanalys', code: 'IY2583', hp: 7.5, year: 4, semester: 'HT', prerequisites: ['IY1422'] },
    { name: 'Strategi och affärsutveckling', code: 'IY2628', hp: 7.5, year: 4, semester: 'VT' },
    { name: 'Projektkurs i industriell ekonomi och projektledning', code: 'IY2585', hp: 7.5, year: 4, semester: 'VT' },
    // År 5 – MAS1
    { name: 'Ekonomisk analys av teknikskiften', code: 'IY2655', hp: 7.5, year: 5, semester: 'HT' },
    { name: 'Forskningsmetod och design', code: 'IY2654', hp: 7.5, year: 5, semester: 'HT' },
    { name: 'Examensarbete för civilingenjörer', code: 'TE2502', hp: 30, year: 5, semester: 'VT', prerequisites: ['IY2654'] },
  ],
};
