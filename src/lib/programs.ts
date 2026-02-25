export interface ProgramCourse {
  name: string;
  code: string;
  hp: number;
  year: number;
  semester: 'HT' | 'VT';
}

export interface ProgramTemplate {
  name: string;
  courses: ProgramCourse[];
}

export const bthPrograms: ProgramTemplate[] = [
  {
    name: 'Civilingenjör i industriell ekonomi och management, 300 HP',
    courses: [
      // År 1
      { name: 'Grunderna i industriell ekonomi', code: 'IY1418', hp: 6, year: 1, semester: 'HT' },
      { name: 'Linjär algebra', code: 'MA1498', hp: 6, year: 1, semester: 'HT' },
      { name: 'Introduktion till ingenjörsrollen', code: 'IY1445', hp: 6, year: 1, semester: 'HT' },
      { name: 'Programmering och problemlösning med Python', code: 'DV1574', hp: 6, year: 1, semester: 'VT' },
      { name: 'Envariabelanalys 1: funktioner och differentialkalkyl', code: 'MA1499', hp: 6, year: 1, semester: 'VT' },
      { name: 'Kraft och energi', code: 'FY1436', hp: 6, year: 1, semester: 'VT' },
      { name: 'Envariabelanalys 2: differentialekvationer och integralkalkyl', code: 'MA1500', hp: 6, year: 1, semester: 'VT' },
      { name: 'Grundkurs i hållbar utveckling', code: 'SL1423', hp: 6, year: 1, semester: 'VT' },
      { name: 'Industriell verksamhetsstyrning', code: 'IY1451', hp: 6, year: 1, semester: 'VT' },
      { name: 'Makroekonomi', code: 'IY1447', hp: 6, year: 1, semester: 'VT' },
      // År 2
      { name: 'Mikroekonomi för beslutsfattare', code: 'IY1446', hp: 6, year: 2, semester: 'HT' },
      { name: 'Flervariabelanalys', code: 'MA1501', hp: 6, year: 2, semester: 'HT' },
      { name: 'Digitalisering och affärsutveckling', code: 'IY1444', hp: 6, year: 2, semester: 'HT' },
      { name: 'Vågfysik', code: 'FY1437', hp: 6, year: 2, semester: 'VT' },
      { name: 'Matematisk statistik', code: 'MS1416', hp: 6, year: 2, semester: 'HT' },
      { name: 'Grundläggande ekonometri', code: 'IY1456', hp: 6, year: 2, semester: 'HT' },
      { name: 'Beslutsfattande i organisationer', code: 'IY1454', hp: 6, year: 2, semester: 'HT' },
      { name: 'Programmering i Python, fortsättningskurs', code: 'DV1582', hp: 6, year: 2, semester: 'HT' },
      { name: 'Supply chain management', code: 'IY1453', hp: 6, year: 2, semester: 'VT' },
      { name: 'Optimering', code: 'MA1502', hp: 6, year: 2, semester: 'VT' },
      // År 3
      { name: 'Dynamiska system och återkoppling', code: 'ET1558', hp: 6, year: 3, semester: 'HT' },
      { name: 'Programvaruutveckling', code: 'PA1484', hp: 6, year: 3, semester: 'HT' },
      { name: 'Tillämpad operationsanalys', code: 'IY1452', hp: 6, year: 3, semester: 'HT' },
      { name: 'Finansiell ekonomi', code: 'IY1457', hp: 6, year: 3, semester: 'VT' },
      { name: 'Ekonomisk analys för strategiskt beslutsfattande', code: 'IY1448', hp: 6, year: 3, semester: 'VT' },
      { name: 'Databasteknik', code: 'DV1663', hp: 6, year: 3, semester: 'VT' },
      { name: 'Kandidatarbete i teknik för industriell ekonomi och management', code: 'TE1432', hp: 18, year: 3, semester: 'VT' },
      { name: 'Företag, organisation och marknad', code: 'IY1455', hp: 6, year: 3, semester: 'VT' },
      // År 4
      { name: 'Ledarskap i högteknologiska och kunskapsintensiva organisationer', code: 'IY2653', hp: 6, year: 4, semester: 'HT' },
      { name: 'Business Analytics', code: 'IY2640', hp: 6, year: 4, semester: 'HT' },
      { name: 'Technology venture 1: Innovation och affärsutveckling', code: 'IY2649', hp: 6, year: 4, semester: 'HT' },
      { name: 'Technology venture 2: kommersialisering av innovationer', code: 'IY2650', hp: 6, year: 4, semester: 'HT' },
      { name: 'Industriell organisation', code: 'IY2634', hp: 6, year: 4, semester: 'VT' },
      { name: 'Avancerad ekonometri', code: 'IY2637', hp: 6, year: 4, semester: 'VT' },
      { name: 'Industriell projektledning inom Business Analytics', code: 'IY2646', hp: 6, year: 4, semester: 'VT' },
      { name: 'Mål- och prestationsstyrning inom industriell verksamhet', code: 'IY2647', hp: 6, year: 4, semester: 'VT' },
      { name: 'Tillämpad konkurrens- och marknadsanalys', code: 'IY2648', hp: 6, year: 4, semester: 'VT' },
      { name: 'Datastrukturer och algoritmer', code: 'DV1682', hp: 6, year: 4, semester: 'VT' },
      // År 5
      { name: 'Avancerad forskningsmetod och design', code: 'IY2638', hp: 6, year: 5, semester: 'HT' },
      { name: 'Tillämpad artificiell intelligens', code: 'DV2659', hp: 6, year: 5, semester: 'HT' },
      { name: 'Produktivitet och teknikskiften', code: 'IY2639', hp: 6, year: 5, semester: 'HT' },
      { name: 'Företagsvärdering och analys', code: 'IY2643', hp: 6, year: 5, semester: 'VT' },
      { name: 'Finansiell modellering', code: 'IY2642', hp: 6, year: 5, semester: 'VT' },
      { name: 'Masterarbete i industriell ekonomi och management', code: 'IY2651', hp: 30, year: 5, semester: 'VT' },
    ],
  },
  {
    name: 'Civilingenjör i AI och maskininlärning, 300 HP',
    courses: [
      { name: 'Introduktion till AI', code: 'DV1697', hp: 6, year: 1, semester: 'HT' },
      { name: 'Linjär algebra', code: 'MA1477', hp: 6, year: 1, semester: 'HT' },
      { name: 'Programmering i Python', code: 'DV1624', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Civilingenjör i datorsäkerhet, 300 HP',
    courses: [
      { name: 'Datorsäkerhet', code: 'DV1625', hp: 6, year: 1, semester: 'HT' },
      { name: 'Nätverksteknik', code: 'ET1489', hp: 6, year: 1, semester: 'HT' },
      { name: 'Diskret matematik', code: 'MA1478', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Civilingenjör i marin teknik, 300 HP',
    courses: [
      { name: 'Marin teknik introduktion', code: 'MT1489', hp: 6, year: 1, semester: 'HT' },
      { name: 'Mekanik', code: 'MT1490', hp: 6, year: 1, semester: 'HT' },
    ],
  },
  {
    name: 'Civilingenjör i maskinteknik - produktutveckling, 300 HP',
    courses: [
      { name: 'Konstruktionsteknik', code: 'ME1581', hp: 6, year: 1, semester: 'HT' },
      { name: 'CAD och modellering', code: 'ME1582', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Civilingenjör i mjukvaruutveckling, 300 HP',
    courses: [
      { name: 'Software Engineering', code: 'PA2576', hp: 6, year: 1, semester: 'HT' },
      { name: 'Databaser', code: 'DV1663', hp: 6, year: 1, semester: 'HT' },
      { name: 'Webbutveckling', code: 'PA2577', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Civilingenjör i spelteknik, 300 HP',
    courses: [
      { name: 'Spelgrafik', code: 'DV1568', hp: 6, year: 1, semester: 'HT' },
      { name: 'Spelprogrammering', code: 'DV1569', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Software Engineering, 180 HP',
    courses: [
      { name: 'Mjukvaruutveckling', code: 'PA2576', hp: 6, year: 1, semester: 'HT' },
      { name: 'Agila metoder', code: 'PA2578', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Webbprogrammering, 120 HP',
    courses: [
      { name: 'Webbteknologier', code: 'DV1609', hp: 6, year: 1, semester: 'HT' },
      { name: 'JavaScript', code: 'DV1610', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Webbprogrammering, 180 HP',
    courses: [
      { name: 'Webbteknologier', code: 'DV1609', hp: 6, year: 1, semester: 'HT' },
      { name: 'Databasteknik', code: 'DV1663', hp: 6, year: 1, semester: 'HT' },
      { name: 'Fullstack-utveckling', code: 'DV1611', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Datavetenskap för spelutveckling, 120 HP',
    courses: [
      { name: 'Speldesign', code: 'DV1570', hp: 6, year: 1, semester: 'HT' },
      { name: 'C++ programmering', code: 'DV1571', hp: 6, year: 1, semester: 'HT' },
    ],
  },
  {
    name: 'Datavetenskap för spelutveckling, 180 HP',
    courses: [
      { name: 'Speldesign', code: 'DV1570', hp: 6, year: 1, semester: 'HT' },
      { name: 'C++ programmering', code: 'DV1571', hp: 6, year: 1, semester: 'HT' },
      { name: 'Spelmotor-utveckling', code: 'DV1572', hp: 6, year: 2, semester: 'HT' },
    ],
  },
  {
    name: 'Högskoleingenjör i IT-säkerhet, 180 HP',
    courses: [
      { name: 'IT-säkerhet grund', code: 'DV1626', hp: 6, year: 1, semester: 'HT' },
      { name: 'Kryptografi', code: 'DV1627', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Högskoleingenjör i marin teknik, 180 HP',
    courses: [
      { name: 'Havsteknik', code: 'MT1491', hp: 6, year: 1, semester: 'HT' },
      { name: 'Strömningslära', code: 'MT1492', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Högskoleingenjör i maskinteknik, 180 HP',
    courses: [
      { name: 'Hållfasthetslära', code: 'ME1583', hp: 6, year: 1, semester: 'HT' },
      { name: 'Tillverkningsteknik', code: 'ME1584', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Högskoleingenjör i teknisk spelgrafik, 180 HP',
    courses: [
      { name: 'Realtidsgrafik', code: 'DV1573', hp: 6, year: 1, semester: 'HT' },
      { name: 'Shader-programmering', code: 'DV1574', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Planeringsarkitektur, 180 HP',
    courses: [
      { name: 'Stadsplanering', code: 'FY1449', hp: 6, year: 1, semester: 'HT' },
      { name: 'GIS-teknik', code: 'FY1450', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Produktutveckling, 120 HP',
    courses: [
      { name: 'Produktdesign', code: 'ME1585', hp: 6, year: 1, semester: 'HT' },
      { name: 'Innovation och kreativitet', code: 'ME1586', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Sjuksköterskeprogrammet, 180 HP',
    courses: [
      { name: 'Omvårdnad', code: 'OM1501', hp: 6, year: 1, semester: 'HT' },
      { name: 'Anatomi', code: 'OM1502', hp: 6, year: 1, semester: 'HT' },
    ],
  },
  {
    name: 'Tekniskt basår, 60 FUP',
    courses: [
      { name: 'Matematik 4', code: 'TB1001', hp: 6, year: 1, semester: 'HT' },
      { name: 'Fysik 2', code: 'TB1002', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Masterprogram i AI och maskininlärning, 120 HP',
    courses: [
      { name: 'Avancerad maskininlärning', code: 'DV2600', hp: 6, year: 1, semester: 'HT' },
      { name: 'Deep Learning', code: 'DV2601', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Masterprogram i Software Engineering, 120 HP',
    courses: [
      { name: 'Avancerad mjukvaruarkitektur', code: 'PA2600', hp: 6, year: 1, semester: 'HT' },
      { name: 'Kravteknik', code: 'PA2601', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Masterprogram i Business Analytics, 120 HP',
    courses: [
      { name: 'Dataanalys', code: 'IY2600', hp: 6, year: 1, semester: 'HT' },
      { name: 'Affärsstrategi', code: 'IY2601', hp: 6, year: 1, semester: 'VT' },
    ],
  },
  {
    name: 'Masterprogram i hållbar stadsplanering, 120 HP',
    courses: [
      { name: 'Hållbar utveckling', code: 'FY2450', hp: 6, year: 1, semester: 'HT' },
      { name: 'Urbanisering', code: 'FY2451', hp: 6, year: 1, semester: 'VT' },
    ],
  },
];
