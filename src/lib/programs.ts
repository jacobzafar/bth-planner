import { ProgramTemplate } from './types';

export const bthPrograms: ProgramTemplate[] = [
  {
    name: 'Civilingenjör i AI och maskininlärning, 300 HP',
    courses: [
      { name: 'Introduktion till AI', code: 'DV1697', blocking: true, importance: 'high' },
      { name: 'Linjär algebra', code: 'MA1477', blocking: true, importance: 'high' },
      { name: 'Programmering i Python', code: 'DV1624', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Civilingenjör i datorsäkerhet, 300 HP',
    courses: [
      { name: 'Datorsäkerhet', code: 'DV1625', blocking: true, importance: 'high' },
      { name: 'Nätverksteknik', code: 'ET1489', blocking: true, importance: 'high' },
      { name: 'Diskret matematik', code: 'MA1478', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Civilingenjör i industriell ekonomi och management, 300 HP',
    courses: [
      { name: 'Industriell ekonomi', code: 'IY2578', blocking: true, importance: 'high' },
      { name: 'Kalkyl', code: 'MA1411', blocking: true, importance: 'high' },
      { name: 'Projektledning', code: 'IY2579', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Civilingenjör i marin teknik, 300 HP',
    courses: [
      { name: 'Marin teknik introduktion', code: 'MT1489', blocking: true, importance: 'high' },
      { name: 'Mekanik', code: 'MT1490', blocking: true, importance: 'high' },
    ],
  },
  {
    name: 'Civilingenjör i maskinteknik - produktutveckling, 300 HP',
    courses: [
      { name: 'Konstruktionsteknik', code: 'ME1581', blocking: true, importance: 'high' },
      { name: 'CAD och modellering', code: 'ME1582', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Civilingenjör i mjukvaruutveckling, 300 HP',
    courses: [
      { name: 'Software Engineering', code: 'PA2576', blocking: true, importance: 'high' },
      { name: 'Databaser', code: 'DV1663', blocking: true, importance: 'high' },
      { name: 'Webbutveckling', code: 'PA2577', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Civilingenjör i spelteknik, 300 HP',
    courses: [
      { name: 'Spelgrafik', code: 'DV1568', blocking: true, importance: 'high' },
      { name: 'Spelprogrammering', code: 'DV1569', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Software Engineering, 180 HP',
    courses: [
      { name: 'Mjukvaruutveckling', code: 'PA2576', blocking: true, importance: 'high' },
      { name: 'Agila metoder', code: 'PA2578', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Webbprogrammering, 120 HP',
    courses: [
      { name: 'Webbteknologier', code: 'DV1609', blocking: true, importance: 'high' },
      { name: 'JavaScript', code: 'DV1610', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Webbprogrammering, 180 HP',
    courses: [
      { name: 'Webbteknologier', code: 'DV1609', blocking: true, importance: 'high' },
      { name: 'Databasteknik', code: 'DV1663', blocking: true, importance: 'high' },
      { name: 'Fullstack-utveckling', code: 'DV1611', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Datavetenskap för spelutveckling, 120 HP',
    courses: [
      { name: 'Speldesign', code: 'DV1570', blocking: false, importance: 'medium' },
      { name: 'C++ programmering', code: 'DV1571', blocking: true, importance: 'high' },
    ],
  },
  {
    name: 'Datavetenskap för spelutveckling, 180 HP',
    courses: [
      { name: 'Speldesign', code: 'DV1570', blocking: false, importance: 'medium' },
      { name: 'C++ programmering', code: 'DV1571', blocking: true, importance: 'high' },
      { name: 'Spelmotor-utveckling', code: 'DV1572', blocking: true, importance: 'high' },
    ],
  },
  {
    name: 'Högskoleingenjör i IT-säkerhet, 180 HP',
    courses: [
      { name: 'IT-säkerhet grund', code: 'DV1626', blocking: true, importance: 'high' },
      { name: 'Kryptografi', code: 'DV1627', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Högskoleingenjör i marin teknik, 180 HP',
    courses: [
      { name: 'Havsteknik', code: 'MT1491', blocking: true, importance: 'high' },
      { name: 'Strömningslära', code: 'MT1492', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Högskoleingenjör i maskinteknik, 180 HP',
    courses: [
      { name: 'Hållfasthetslära', code: 'ME1583', blocking: true, importance: 'high' },
      { name: 'Tillverkningsteknik', code: 'ME1584', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Högskoleingenjör i teknisk spelgrafik, 180 HP',
    courses: [
      { name: 'Realtidsgrafik', code: 'DV1573', blocking: true, importance: 'high' },
      { name: 'Shader-programmering', code: 'DV1574', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Planeringsarkitektur, 180 HP',
    courses: [
      { name: 'Stadsplanering', code: 'FY1449', blocking: true, importance: 'high' },
      { name: 'GIS-teknik', code: 'FY1450', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Produktutveckling, 120 HP',
    courses: [
      { name: 'Produktdesign', code: 'ME1585', blocking: false, importance: 'medium' },
      { name: 'Innovation och kreativitet', code: 'ME1586', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Sjuksköterskeprogrammet, 180 HP',
    courses: [
      { name: 'Omvårdnad', code: 'OM1501', blocking: true, importance: 'high' },
      { name: 'Anatomi', code: 'OM1502', blocking: true, importance: 'high' },
    ],
  },
  {
    name: 'Tekniskt basår, 60 FUP',
    courses: [
      { name: 'Matematik 4', code: 'TB1001', blocking: true, importance: 'high' },
      { name: 'Fysik 2', code: 'TB1002', blocking: true, importance: 'high' },
    ],
  },
  {
    name: 'Masterprogram i AI och maskininlärning, 120 HP',
    courses: [
      { name: 'Avancerad maskininlärning', code: 'DV2600', blocking: true, importance: 'high' },
      { name: 'Deep Learning', code: 'DV2601', blocking: false, importance: 'high' },
    ],
  },
  {
    name: 'Masterprogram i Software Engineering, 120 HP',
    courses: [
      { name: 'Avancerad mjukvaruarkitektur', code: 'PA2600', blocking: true, importance: 'high' },
      { name: 'Kravteknik', code: 'PA2601', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Masterprogram i Business Analytics, 120 HP',
    courses: [
      { name: 'Dataanalys', code: 'IY2600', blocking: true, importance: 'high' },
      { name: 'Affärsstrategi', code: 'IY2601', blocking: false, importance: 'medium' },
    ],
  },
  {
    name: 'Masterprogram i hållbar stadsplanering, 120 HP',
    courses: [
      { name: 'Hållbar utveckling', code: 'FY2450', blocking: true, importance: 'high' },
      { name: 'Urbanisering', code: 'FY2451', blocking: false, importance: 'medium' },
    ],
  },
];
