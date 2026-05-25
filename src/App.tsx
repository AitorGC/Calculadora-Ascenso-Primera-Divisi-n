/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Settings, 
  HelpCircle, 
  RefreshCw, 
  Play, 
  Check, 
  Copy, 
  Sparkles, 
  Flame, 
  Calendar, 
  Sliders, 
  FileText,
  TrendingUp,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// -------------------------------------------------------------------------
// Tipados e Interfaces
// -------------------------------------------------------------------------

interface Team {
  id: string;
  name: string;
  points: number;
  gf: number; // Goles a Favor
  gc: number; // Goles en Contra
  dg: number; // Diferencia de Goles (computed derived)
  color: string;
  shortName: string;
  isExternal?: boolean;
  juegoLimpio: number; // Puntos de desempate de Juego Limpio (menos es mejor)
}

interface H2HMatch {
  id: string;
  teamA: string; // ID Team A
  teamB: string; // ID Team B
  goalsA: number;
  goalsB: number;
}

interface Fixture {
  id: string;
  local: string;   // ID Team
  visitante: string; // ID Team
  golesLocal: number | null;
  golesVisitante: number | null;
}

interface SimulationResult {
  teamName: string;
  teamId: string;
  directo: number; // conteo de veces en puesto 1 ó 2
  playoff: number; // conteo de veces en puesto 3 al 6
  permanencia: number; // puesto 7 o peor
  totalScenarios: number;
}

export default function App() {
  // -------------------------------------------------------------------------
  // 1. Estado de la Aplicación
  // -------------------------------------------------------------------------
  
  // Pestaña activa de la interfaz: 'simulador' / 'h2h' / 'reglamento'
  const [activeTab, setActiveTab ] = useState<'simulador' | 'h2h' | 'reglamento'>('simulador');

  // Equipos en liza por el ascenso (por defecto LaLiga Hypermotion)
  const [teams, setTeams] = useState<Team[]>([
    { id: 'racing', name: 'Racing de Santander', shortName: 'RAC', points: 79, gf: 86, gc: 60, dg: 26, color: '#16a34a', juegoLimpio: 78 },
    { id: 'deportivo', name: 'RC Deportivo', shortName: 'DEP', points: 77, gf: 64, gc: 42, dg: 22, color: '#2563eb', juegoLimpio: 84 },
    { id: 'almeria', name: 'UD Almería', shortName: 'ALM', points: 71, gf: 80, gc: 63, dg: 17, color: '#e11d48', juegoLimpio: 69 },
    { id: 'malaga', name: 'Málaga CF', shortName: 'MAL', points: 70, gf: 73, gc: 52, dg: 21, color: '#0ea5e9', juegoLimpio: 75 },
    { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'LPA', points: 70, gf: 55, gc: 39, dg: 16, color: '#ffd200', juegoLimpio: 72 },
    { id: 'castellon', name: 'CD Castellón', shortName: 'CAS', points: 69, gf: 68, gc: 50, dg: 18, color: '#4b5563', juegoLimpio: 88 },
    { id: 'burgos', name: 'Burgos CF', shortName: 'BUR', points: 69, gf: 47, gc: 33, dg: 14, color: '#0f172a', juegoLimpio: 81 },
    { id: 'eibar', name: 'SD Eibar', shortName: 'EIB', points: 67, gf: 51, gc: 38, dg: 13, color: '#dc2626', juegoLimpio: 74 },
    { id: 'cadiz', name: 'Cádiz CF', shortName: 'CAD', points: 10, gf: 0, gc: 0, dg: 0, color: '#eab308', isExternal: true, juegoLimpio: 65 },
    { id: 'valladolid', name: 'Real Valladolid', shortName: 'VLL', points: 10, gf: 0, gc: 0, dg: 0, color: '#c084fc', isExternal: true, juegoLimpio: 70 },
    { id: 'zaragoza', name: 'Real Zaragoza', shortName: 'ZAR', points: 10, gf: 0, gc: 0, dg: 0, color: '#60a5fa', isExternal: true, juegoLimpio: 72 },
    { id: 'andorra', name: 'FC Andorra', shortName: 'AND', points: 10, gf: 0, gc: 0, dg: 0, color: '#a1a1aa', isExternal: true, juegoLimpio: 79 },
  ]);

  // Enfrentamientos directos (H2H) iniciales
  const [h2h, setH2H] = useState<H2HMatch[]>([
    // 1. Almería as Local
    { id: 'h1', teamA: 'almeria', teamB: 'andorra', goalsA: 3, goalsB: 2 },
    { id: 'h2', teamA: 'almeria', teamB: 'burgos', goalsA: 1, goalsB: 2 },
    { id: 'h3', teamA: 'almeria', teamB: 'cadiz', goalsA: 3, goalsB: 0 },
    { id: 'h4', teamA: 'almeria', teamB: 'castellon', goalsA: 1, goalsB: 0 },
    { id: 'h5', teamA: 'almeria', teamB: 'deportivo', goalsA: 1, goalsB: 2 },
    { id: 'h6', teamA: 'almeria', teamB: 'eibar', goalsA: 3, goalsB: 1 },
    { id: 'h7', teamA: 'almeria', teamB: 'laspalmas', goalsA: 1, goalsB: 2 },
    { id: 'h8', teamA: 'almeria', teamB: 'malaga', goalsA: 3, goalsB: 2 },
    { id: 'h9', teamA: 'almeria', teamB: 'racing', goalsA: 2, goalsB: 3 },
    { id: 'h10', teamA: 'almeria', teamB: 'zaragoza', goalsA: 4, goalsB: 2 },

    // 2. Andorra as Local
    { id: 'h11', teamA: 'andorra', teamB: 'almeria', goalsA: 1, goalsB: 2 },
    { id: 'h12', teamA: 'andorra', teamB: 'burgos', goalsA: 2, goalsB: 1 },
    { id: 'h13', teamA: 'andorra', teamB: 'cadiz', goalsA: 0, goalsB: 0 },
    { id: 'h14', teamA: 'andorra', teamB: 'castellon', goalsA: 1, goalsB: 3 },
    { id: 'h15', teamA: 'andorra', teamB: 'deportivo', goalsA: 1, goalsB: 0 },
    { id: 'h16', teamA: 'andorra', teamB: 'eibar', goalsA: 0, goalsB: 1 },
    { id: 'h17', teamA: 'andorra', teamB: 'laspalmas', goalsA: 5, goalsB: 1 },
    { id: 'h18', teamA: 'andorra', teamB: 'malaga', goalsA: 3, goalsB: 3 },
    { id: 'h19', teamA: 'andorra', teamB: 'racing', goalsA: 6, goalsB: 2 },
    { id: 'h20', teamA: 'andorra', teamB: 'valladolid', goalsA: 1, goalsB: 0 },
    { id: 'h21', teamA: 'andorra', teamB: 'zaragoza', goalsA: 2, goalsB: 1 },

    // 3. Burgos as Local
    { id: 'h22', teamA: 'burgos', teamB: 'almeria', goalsA: 0, goalsB: 0 },
    { id: 'h23', teamA: 'burgos', teamB: 'cadiz', goalsA: 1, goalsB: 1 },
    { id: 'h24', teamA: 'burgos', teamB: 'castellon', goalsA: 0, goalsB: 0 },
    { id: 'h25', teamA: 'burgos', teamB: 'deportivo', goalsA: 1, goalsB: 1 },
    { id: 'h26', teamA: 'burgos', teamB: 'eibar', goalsA: 1, goalsB: 0 },
    { id: 'h27', teamA: 'burgos', teamB: 'laspalmas', goalsA: 0, goalsB: 0 },
    { id: 'h28', teamA: 'burgos', teamB: 'malaga', goalsA: 2, goalsB: 1 },
    { id: 'h29', teamA: 'burgos', teamB: 'racing', goalsA: 0, goalsB: 2 },
    { id: 'h30', teamA: 'burgos', teamB: 'valladolid', goalsA: 0, goalsB: 1 },
    { id: 'h31', teamA: 'burgos', teamB: 'zaragoza', goalsA: 1, goalsB: 1 },

    // 4. Cádiz as Local
    { id: 'h32', teamA: 'cadiz', teamB: 'almeria', goalsA: 1, goalsB: 2 },
    { id: 'h33', teamA: 'cadiz', teamB: 'andorra', goalsA: 0, goalsB: 1 },
    { id: 'h34', teamA: 'cadiz', teamB: 'burgos', goalsA: 1, goalsB: 3 },
    { id: 'h35', teamA: 'cadiz', teamB: 'castellon', goalsA: 2, goalsB: 0 },
    { id: 'h36', teamA: 'cadiz', teamB: 'deportivo', goalsA: 0, goalsB: 1 },
    { id: 'h37', teamA: 'cadiz', teamB: 'eibar', goalsA: 1, goalsB: 0 },
    { id: 'h38', teamA: 'cadiz', teamB: 'laspalmas', goalsA: 1, goalsB: 2 },
    { id: 'h39', teamA: 'cadiz', teamB: 'malaga', goalsA: 0, goalsB: 3 },
    { id: 'h40', teamA: 'cadiz', teamB: 'racing', goalsA: 2, goalsB: 3 },
    { id: 'h41', teamA: 'cadiz', teamB: 'valladolid', goalsA: 0, goalsB: 0 },
    { id: 'h42', teamA: 'cadiz', teamB: 'zaragoza', goalsA: 0, goalsB: 1 },

    // 5. Castellón as Local
    { id: 'h43', teamA: 'castellon', teamB: 'almeria', goalsA: 2, goalsB: 0 },
    { id: 'h44', teamA: 'castellon', teamB: 'andorra', goalsA: 2, goalsB: 0 },
    { id: 'h45', teamA: 'castellon', teamB: 'burgos', goalsA: 3, goalsB: 1 },
    { id: 'h46', teamA: 'castellon', teamB: 'cadiz', goalsA: 1, goalsB: 1 },
    { id: 'h47', teamA: 'castellon', teamB: 'deportivo', goalsA: 2, goalsB: 0 },
    { id: 'h48', teamA: 'castellon', teamB: 'laspalmas', goalsA: 1, goalsB: 0 },
    { id: 'h49', teamA: 'castellon', teamB: 'malaga', goalsA: 2, goalsB: 1 },
    { id: 'h50', teamA: 'castellon', teamB: 'racing', goalsA: 1, goalsB: 3 },
    { id: 'h51', teamA: 'castellon', teamB: 'valladolid', goalsA: 0, goalsB: 1 },
    { id: 'h52', teamA: 'castellon', teamB: 'zaragoza', goalsA: 1, goalsB: 1 },

    // 6. Deportivo as Local
    { id: 'h53', teamA: 'deportivo', teamB: 'almeria', goalsA: 1, goalsB: 1 },
    { id: 'h54', teamA: 'deportivo', teamB: 'andorra', goalsA: 2, goalsB: 1 },
    { id: 'h55', teamA: 'deportivo', teamB: 'burgos', goalsA: 0, goalsB: 0 },
    { id: 'h56', teamA: 'deportivo', teamB: 'cadiz', goalsA: 2, goalsB: 2 },
    { id: 'h57', teamA: 'deportivo', teamB: 'castellon', goalsA: 1, goalsB: 3 },
    { id: 'h58', teamA: 'deportivo', teamB: 'eibar', goalsA: 1, goalsB: 0 },
    { id: 'h59', teamA: 'deportivo', teamB: 'malaga', goalsA: 1, goalsB: 1 },
    { id: 'h60', teamA: 'deportivo', teamB: 'racing', goalsA: 0, goalsB: 1 },
    { id: 'h61', teamA: 'deportivo', teamB: 'valladolid', goalsA: 1, goalsB: 1 },
    { id: 'h62', teamA: 'deportivo', teamB: 'zaragoza', goalsA: 2, goalsB: 1 },

    // 7. Eibar as Local
    { id: 'h63', teamA: 'eibar', teamB: 'almeria', goalsA: 1, goalsB: 0 },
    { id: 'h64', teamA: 'eibar', teamB: 'andorra', goalsA: 2, goalsB: 0 },
    { id: 'h65', teamA: 'eibar', teamB: 'burgos', goalsA: 0, goalsB: 0 },
    { id: 'h66', teamA: 'eibar', teamB: 'cadiz', goalsA: 3, goalsB: 1 },
    { id: 'h67', teamA: 'eibar', teamB: 'castellon', goalsA: 0, goalsB: 0 },
    { id: 'h68', teamA: 'eibar', teamB: 'deportivo', goalsA: 1, goalsB: 1 },
    { id: 'h69', teamA: 'eibar', teamB: 'laspalmas', goalsA: 3, goalsB: 1 },
    { id: 'h70', teamA: 'eibar', teamB: 'malaga', goalsA: 2, goalsB: 4 },
    { id: 'h71', teamA: 'eibar', teamB: 'racing', goalsA: 2, goalsB: 1 },
    { id: 'h72', teamA: 'eibar', teamB: 'valladolid', goalsA: 3, goalsB: 0 },
    { id: 'h73', teamA: 'eibar', teamB: 'zaragoza', goalsA: 1, goalsB: 2 },

    // 8. Las Palmas as Local
    { id: 'h74', teamA: 'laspalmas', teamB: 'almeria', goalsA: 0, goalsB: 1 },
    { id: 'h75', teamA: 'laspalmas', teamB: 'andorra', goalsA: 1, goalsB: 1 },
    { id: 'h76', teamA: 'laspalmas', teamB: 'burgos', goalsA: 0, goalsB: 0 },
    { id: 'h77', teamA: 'laspalmas', teamB: 'cadiz', goalsA: 1, goalsB: 0 },
    { id: 'h78', teamA: 'laspalmas', teamB: 'castellon', goalsA: 1, goalsB: 1 },
    { id: 'h79', teamA: 'laspalmas', teamB: 'deportivo', goalsA: 1, goalsB: 1 },
    { id: 'h80', teamA: 'laspalmas', teamB: 'eibar', goalsA: 3, goalsB: 1 },
    { id: 'h81', teamA: 'laspalmas', teamB: 'malaga', goalsA: 0, goalsB: 1 },
    { id: 'h82', teamA: 'laspalmas', teamB: 'racing', goalsA: 3, goalsB: 1 },
    { id: 'h83', teamA: 'laspalmas', teamB: 'valladolid', goalsA: 2, goalsB: 1 },
    { id: 'h84', teamA: 'laspalmas', teamB: 'zaragoza', goalsA: 1, goalsB: 1 },

    // 9. Málaga as Local
    { id: 'h85', teamA: 'malaga', teamB: 'almeria', goalsA: 2, goalsB: 1 },
    { id: 'h86', teamA: 'malaga', teamB: 'andorra', goalsA: 4, goalsB: 1 },
    { id: 'h87', teamA: 'malaga', teamB: 'burgos', goalsA: 3, goalsB: 0 },
    { id: 'h88', teamA: 'malaga', teamB: 'cadiz', goalsA: 0, goalsB: 1 },
    { id: 'h89', teamA: 'malaga', teamB: 'castellon', goalsA: 2, goalsB: 3 },
    { id: 'h90', teamA: 'malaga', teamB: 'deportivo', goalsA: 3, goalsB: 0 },
    { id: 'h91', teamA: 'malaga', teamB: 'eibar', goalsA: 1, goalsB: 1 },
    { id: 'h92', teamA: 'malaga', teamB: 'laspalmas', goalsA: 2, goalsB: 0 },
    { id: 'h93', teamA: 'malaga', teamB: 'racing', goalsA: 1, goalsB: 1 },
    { id: 'h94', teamA: 'malaga', teamB: 'valladolid', goalsA: 2, goalsB: 1 },
    { id: 'h95', teamA: 'malaga', teamB: 'zaragoza', goalsA: 3, goalsB: 3 },

    // 10. Racing as Local
    { id: 'h96', teamA: 'racing', teamB: 'almeria', goalsA: 5, goalsB: 1 },
    { id: 'h97', teamA: 'racing', teamB: 'andorra', goalsA: 1, goalsB: 2 },
    { id: 'h98', teamA: 'racing', teamB: 'burgos', goalsA: 1, goalsB: 0 },
    { id: 'h99', teamA: 'racing', teamB: 'castellon', goalsA: 3, goalsB: 1 },
    { id: 'h100', teamA: 'racing', teamB: 'deportivo', goalsA: 2, goalsB: 1 },
    { id: 'h101', teamA: 'racing', teamB: 'eibar', goalsA: 4, goalsB: 0 },
    { id: 'h102', teamA: 'racing', teamB: 'laspalmas', goalsA: 4, goalsB: 1 },
    { id: 'h103', teamA: 'racing', teamB: 'malaga', goalsA: 3, goalsB: 0 },
    { id: 'h104', teamA: 'racing', teamB: 'valladolid', goalsA: 4, goalsB: 1 },
    { id: 'h105', teamA: 'racing', teamB: 'zaragoza', goalsA: 2, goalsB: 3 },

    // 11. Valladolid as Local
    { id: 'h106', teamA: 'valladolid', teamB: 'almeria', goalsA: 3, goalsB: 1 },
    { id: 'h107', teamA: 'valladolid', teamB: 'andorra', goalsA: 0, goalsB: 1 },
    { id: 'h108', teamA: 'valladolid', teamB: 'burgos', goalsA: 0, goalsB: 1 },
    { id: 'h109', teamA: 'valladolid', teamB: 'cadiz', goalsA: 3, goalsB: 0 },
    { id: 'h110', teamA: 'valladolid', teamB: 'castellon', goalsA: 0, goalsB: 4 },
    { id: 'h111', teamA: 'valladolid', teamB: 'deportivo', goalsA: 0, goalsB: 2 },
    { id: 'h112', teamA: 'valladolid', teamB: 'eibar', goalsA: 0, goalsB: 1 },
    { id: 'h113', teamA: 'valladolid', teamB: 'laspalmas', goalsA: 0, goalsB: 1 },
    { id: 'h114', teamA: 'valladolid', teamB: 'malaga', goalsA: 1, goalsB: 1 },
    { id: 'h115', teamA: 'valladolid', teamB: 'racing', goalsA: 1, goalsB: 1 },
    { id: 'h116', teamA: 'valladolid', teamB: 'zaragoza', goalsA: 2, goalsB: 0 },

    // 12. Zaragoza as Local
    { id: 'h117', teamA: 'zaragoza', teamB: 'almeria', goalsA: 2, goalsB: 0 },
    { id: 'h118', teamA: 'zaragoza', teamB: 'andorra', goalsA: 1, goalsB: 3 },
    { id: 'h119', teamA: 'zaragoza', teamB: 'burgos', goalsA: 0, goalsB: 1 },
    { id: 'h120', teamA: 'zaragoza', teamB: 'cadiz', goalsA: 1, goalsB: 2 },
    { id: 'h121', teamA: 'zaragoza', teamB: 'castellon', goalsA: 0, goalsB: 0 },
    { id: 'h122', teamA: 'zaragoza', teamB: 'deportivo', goalsA: 0, goalsB: 2 },
    { id: 'h123', teamA: 'zaragoza', teamB: 'eibar', goalsA: 1, goalsB: 1 },
    { id: 'h124', teamA: 'zaragoza', teamB: 'laspalmas', goalsA: 1, goalsB: 2 },
    { id: 'h125', teamA: 'zaragoza', teamB: 'racing', goalsA: 0, goalsB: 1 },
    { id: 'h126', teamA: 'zaragoza', teamB: 'valladolid', goalsA: 1, goalsB: 3 }
  ]);

  // Selección de equipo de foco para mostrar análisis especializado en la barra superior
  const [selectedFocusTeam, setSelectedFocusTeam] = useState<string>('laspalmas');

  // Partidos restantes a simular / fijar
  const [fixtures, setFixtures] = useState<Fixture[]>([
    { id: 'f1', local: 'castellon', visitante: 'eibar', golesLocal: null, golesVisitante: null },
    { id: 'f2', local: 'deportivo', visitante: 'laspalmas', golesLocal: null, golesVisitante: null },
    { id: 'f3', local: 'racing', visitante: 'cadiz', golesLocal: null, golesVisitante: null },
    { id: 'f4', local: 'almeria', visitante: 'valladolid', golesLocal: null, golesVisitante: null },
    { id: 'f5', local: 'zaragoza', visitante: 'malaga', golesLocal: null, golesVisitante: null },
    { id: 'f6', local: 'burgos', visitante: 'andorra', golesLocal: null, golesVisitante: null },
  ]);

  // -------------------------------------------------------------------------
  // 2. Lógica RFEF Solver (Algoritmo de Desempate Multiequipo)
  // -------------------------------------------------------------------------

  const resolveTwoTeamsTie = (a: Team, b: Team, currentH2H: H2HMatch[]): Team[] => {
    // RFEF rules: head-to-head tiebreaker only applies if both matches (home and away) have been played.
    // If fewer than 2 matches have been played, the tie is broken immediately by global league stats.
    const matchesBetween = currentH2H.filter(
      m => (m.teamA === a.id && m.teamB === b.id) || (m.teamA === b.id && m.teamB === a.id)
    );

    if (matchesBetween.length < 2) {
      if (a.dg !== b.dg) return a.dg > b.dg ? [a, b] : [b, a];
      if (a.gf !== b.gf) return a.gf > b.gf ? [a, b] : [b, a];
      const jlA = a.juegoLimpio ?? 0;
      const jlB = b.juegoLimpio ?? 0;
      if (jlA !== jlB) return jlA < jlB ? [a, b] : [b, a];
      return a.name.localeCompare(b.name) < 0 ? [a, b] : [b, a];
    }

    let gfA = 0;
    let gfB = 0;

    matchesBetween.forEach(m => {
      if (m.teamA === a.id && m.teamB === b.id) {
        gfA += m.goalsA;
        gfB += m.goalsB;
      } else if (m.teamA === b.id && m.teamB === a.id) {
        gfA += m.goalsB;
        gfB += m.goalsA;
      }
    });

    // 1. Mayor diferencia de goles entre los anotados y recibidos en los partidos disputados entre ellos.
    const diffH2H = gfA - gfB;
    if (diffH2H > 0) return [a, b];
    if (diffH2H < 0) return [b, a];

    // 2. Mayor diferencia de goles entre los anotados y recibidos en el cómputo general de la competición.
    if (a.dg !== b.dg) {
      return a.dg > b.dg ? [a, b] : [b, a];
    }

    // 3. El que hubiera conseguido el mayor número de goles a favor.
    if (a.gf !== b.gf) {
      return a.gf > b.gf ? [a, b] : [b, a];
    }

    // 4. El que hubiera obtenido mejor clasificación en los criterios del juego limpio. (Menor es mejor)
    const jlA = a.juegoLimpio ?? 0;
    const jlB = b.juegoLimpio ?? 0;
    if (jlA !== jlB) {
      return jlA < jlB ? [a, b] : [b, a];
    }

    // 5. Partido en campo neutral (Desempate alfabético como fallback predictivo)
    return a.name.localeCompare(b.name) < 0 ? [a, b] : [b, a];
  };

  const resolveMultipleTeamsTie = (tiedTeams: Team[], currentH2H: H2HMatch[]): Team[] => {
    const ids = tiedTeams.map(t => t.id);

    // RFEF rules: multiple-team tiebreaker mini-league only applies if all matchups between the tied teams
    // have been fully completed (i.e. each pairing has played 2 matches). Total expected matches is K * (K - 1).
    // If incomplete, the entire tie is broken immediately using global league stats.
    const matchesBetween = currentH2H.filter(
      m => ids.includes(m.teamA) && ids.includes(m.teamB)
    );
    const expectedMatchesCount = ids.length * (ids.length - 1);

    if (matchesBetween.length < expectedMatchesCount) {
      return [...tiedTeams].sort((a, b) => {
        if (a.dg !== b.dg) return b.dg - a.dg;
        if (a.gf !== b.gf) return b.gf - a.gf;
        const jlA = a.juegoLimpio ?? 0;
        const jlB = b.juegoLimpio ?? 0;
        if (jlA !== jlB) return jlA - jlB;
        return a.name.localeCompare(b.name);
      });
    }

    const miniStats: { [id: string]: { pts: number; dg: number; gf: number } } = {};
    
    tiedTeams.forEach(t => {
      miniStats[t.id] = { pts: 0, dg: 0, gf: 0 };
    });

    matchesBetween.forEach(m => {
      const gA = m.goalsA;
      const gB = m.goalsB;
      miniStats[m.teamA].dg += (gA - gB);
      miniStats[m.teamB].dg += (gB - gA);
      miniStats[m.teamA].gf += gA;
      miniStats[m.teamB].gf += gB;

      if (gA > gB) {
        miniStats[m.teamA].pts += 3;
      } else if (gB > gA) {
        miniStats[m.teamB].pts += 3;
      } else {
        miniStats[m.teamA].pts += 1;
        miniStats[m.teamB].pts += 1;
      }
    });

    return [...tiedTeams].sort((a, b) => {
      const statsA = miniStats[a.id];
      const statsB = miniStats[b.id];

      // 1. Mejor puntuación de los partidos disputados entre ellos, como si los demás equipos no participaran.
      if (statsA.pts !== statsB.pts) return statsB.pts - statsA.pts;

      // 2. Mayor diferencia de goles a favor y en contra entre los partidos disputados entre ellos.
      if (statsA.dg !== statsB.dg) return statsB.dg - statsA.dg;

      // 3. Mayor diferencia de goles entre los anotados y recibidos en el cómputo general de la competición.
      if (a.dg !== b.dg) return b.dg - a.dg;

      // 4. El que hubiera conseguido el mayor número de goles a favor.
      if (a.gf !== b.gf) return b.gf - a.gf;

      // 5. El que hubiera obtenido mejor clasificación en los criterios del juego limpio. (Menor es mejor)
      const jlA = a.juegoLimpio ?? 0;
      const jlB = b.juegoLimpio ?? 0;
      if (jlA !== jlB) return jlA - jlB;

      // Fallback
      return a.name.localeCompare(b.name);
    });
  };

  const sortTeamsRFEF = (teamList: Team[], currentH2H: H2HMatch[]): Team[] => {
    // Agrupar por puntos
    const pGroups: { [points: number]: Team[] } = {};
    teamList.forEach(t => {
      const p = t.points;
      if (!pGroups[p]) pGroups[p] = [];
      pGroups[p].push(t);
    });

    const uniquePointsSorted = Object.keys(pGroups).map(Number).sort((a, b) => b - a);
    let fullySorted: Team[] = [];

    uniquePointsSorted.forEach(pts => {
      const subGroup = pGroups[pts];
      if (subGroup.length === 1) {
        fullySorted.push(subGroup[0]);
      } else if (subGroup.length === 2) {
        const ordered = resolveTwoTeamsTie(subGroup[0], subGroup[1], currentH2H);
        fullySorted.push(...ordered);
      } else {
        const ordered = resolveMultipleTeamsTie(subGroup, currentH2H);
        fullySorted.push(...ordered);
      }
    });

    return fullySorted;
  };

  // -------------------------------------------------------------------------
  // 3. Clasificación actual con inputs del usuario
  // -------------------------------------------------------------------------
  const currentClassification = useMemo(() => {
    // Copiar equipos base
    const virtualTeams = teams.map(t => ({ ...t }));
    
    // Merge known/locked J42 scores into a dynamic H2H array for the RFEF solver
    const dynamicH2H = [...h2h];

    // Aplicar partidos fijos
    fixtures.forEach(f => {
      if (f.golesLocal !== null && f.golesVisitante !== null) {
        const gl = f.golesLocal;
        const gv = f.golesVisitante;
        
        const loc = virtualTeams.find(t => t.id === f.local);
        const vis = virtualTeams.find(t => t.id === f.visitante);
        
        if (loc && vis) {
          loc.gf += gl;
          loc.gc += gv;
          loc.dg += (gl - gv);
          vis.gf += gv;
          vis.gc += gl;
          vis.dg += (gv - gl);
          
          if (gl > gv) {
            loc.points += 3;
          } else if (gv > gl) {
            vis.points += 3;
          } else {
            loc.points += 1;
            vis.points += 1;
          }

          // Register this completed game in the tiebreaker list
          dynamicH2H.push({
            id: `h2h_live_j42_${f.id}`,
            teamA: f.local,
            teamB: f.visitante,
            goalsA: gl,
            goalsB: gv
          });
        }
      }
    });
    
    return sortTeamsRFEF(virtualTeams, dynamicH2H).filter(t => !t.isExternal);
  }, [teams, h2h, fixtures]);

  // -------------------------------------------------------------------------
  // 4. Motor de combinatoria y simulación masiva en tiempo real
  // -------------------------------------------------------------------------
  const simulationData = useMemo(() => {
    const listLibres = fixtures.filter(f => f.golesLocal === null || f.golesVisitante === null);
    const listFijos = fixtures.filter(f => f.golesLocal !== null && f.golesVisitante !== null);
    
    // Generar combinaciones para los partidos libres
    // 3^N combinaciones
    // Cada partido libre genera tres caminos: '1', 'X', '2'
    const totalCombos = Math.pow(3, listLibres.length);
    
    // Inicializar contadores de resultados para cada equipo
    const statsMap: { [id: string]: { directo: number; playoff: number; permanencia: number } } = {};
    teams.forEach(t => {
      statsMap[t.id] = { directo: 0, playoff: 0, permanencia: 0 };
    });

    // Helper recursivo o iterativo para simular
    // Para simplificar y optimizar, utilizaremos fuerza bruta iterativa generando combinaciones en cascada
    for (let c = 0; c < totalCombos; c++) {
      // Crear base de tabla con equipos base
      const tempTeamsMap: { [id: string]: Team } = {};
      teams.forEach(t => {
        tempTeamsMap[t.id] = { ...t };
      });

      // We maintain a dynamic H2H match list for this scenario to let RFEF resolve ties correctly
      const comboH2H = [...h2h];

      // 1. Aplicar partidos fijos
      listFijos.forEach(f => {
        const gl = f.golesLocal as number;
        const gv = f.golesVisitante as number;
        
        tempTeamsMap[f.local].gf += gl;
        tempTeamsMap[f.local].gc += gv;
        tempTeamsMap[f.local].dg += (gl - gv);

        tempTeamsMap[f.visitante].gf += gv;
        tempTeamsMap[f.visitante].gc += gl;
        tempTeamsMap[f.visitante].dg += (gv - gl);

        if (gl > gv) {
          tempTeamsMap[f.local].points += 3;
        } else if (gv > gl) {
          tempTeamsMap[f.visitante].points += 3;
        } else {
          tempTeamsMap[f.local].points += 1;
          tempTeamsMap[f.visitante].points += 1;
        }

        comboH2H.push({
          id: `h2h_comb_fix_${f.id}`,
          teamA: f.local,
          teamB: f.visitante,
          goalsA: gl,
          goalsB: gv
        });
      });

      // 2. Aplicar combinación c-ésima para los partidos libres
      let num = c;
      for (let i = 0; i < listLibres.length; i++) {
        const outcomeIndex = num % 3;
        num = Math.floor(num / 3);
        const f = listLibres[i];
        
        // Simulado: asumimos goles representativos
        if (outcomeIndex === 0) { // Victoria Local (1-0)
          tempTeamsMap[f.local].points += 3;
          tempTeamsMap[f.local].gf += 1;
          tempTeamsMap[f.local].dg += 1;
          tempTeamsMap[f.visitante].gc += 1;
          tempTeamsMap[f.visitante].dg -= 1;
          
          comboH2H.push({
            id: `h2h_comb_lib_${f.id}`,
            teamA: f.local,
            teamB: f.visitante,
            goalsA: 1,
            goalsB: 0
          });
        } else if (outcomeIndex === 1) { // Empate (1-1)
          tempTeamsMap[f.local].points += 1;
          tempTeamsMap[f.visitante].points += 1;
          tempTeamsMap[f.local].gf += 1;
          tempTeamsMap[f.local].gc += 1;
          tempTeamsMap[f.visitante].gf += 1;
          tempTeamsMap[f.visitante].gc += 1;

          comboH2H.push({
            id: `h2h_comb_lib_${f.id}`,
            teamA: f.local,
            teamB: f.visitante,
            goalsA: 1,
            goalsB: 1
          });
        } else { // Victoria Visitante (0-1)
          tempTeamsMap[f.visitante].points += 3;
          tempTeamsMap[f.visitante].gf += 1;
          tempTeamsMap[f.visitante].dg += 1;
          tempTeamsMap[f.local].gc += 1;
          tempTeamsMap[f.local].dg -= 1;

          comboH2H.push({
            id: `h2h_comb_lib_${f.id}`,
            teamA: f.local,
            teamB: f.visitante,
            goalsA: 0,
            goalsB: 1
          });
        }
      }

      // 3. Ordenar tabla de este escenario concreto usando la lógica RFEF con el comboH2H
      const simList = Object.values(tempTeamsMap);
      const sortedScenario = sortTeamsRFEF(simList, comboH2H);

      // 4. Asignar posiciones y sumar contadores
      sortedScenario.forEach((team_sim, index) => {
        const pos = index + 1;
        if (pos <= 2) {
          statsMap[team_sim.id].directo++;
        } else if (pos <= 6) {
          statsMap[team_sim.id].playoff++;
        } else {
          statsMap[team_sim.id].permanencia++;
        }
      });
    }

    // Convertir a formato utilizable
    const results: SimulationResult[] = teams.map(t => {
      return {
        teamId: t.id,
        teamName: t.name,
        directo: statsMap[t.id].directo,
        playoff: statsMap[t.id].playoff,
        permanencia: statsMap[t.id].permanencia,
        totalScenarios: totalCombos
      };
    });

    return {
      results,
      totalScenarios: totalCombos
    };

  }, [teams, h2h, fixtures]);

  // -------------------------------------------------------------------------
  // 5. Manejadores de Eventos del Usuario
  // -------------------------------------------------------------------------

  const handleUpdatePoints = (teamId: string, value: number) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return { ...t, points: Math.max(0, value) };
      }
      return t;
    }));
  };

  const handleUpdateGF = (teamId: string, value: number) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const newGf = Math.max(0, value);
        return { ...t, gf: newGf, dg: newGf - t.gc };
      }
      return t;
    }));
  };

  const handleUpdateGC = (teamId: string, value: number) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const newGc = Math.max(0, value);
        return { ...t, gc: newGc, dg: t.gf - newGc };
      }
      return t;
    }));
  };

  const handleUpdateJuegoLimpio = (teamId: string, value: number) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return { ...t, juegoLimpio: Math.max(0, value) };
      }
      return t;
    }));
  };

  const handleUpdateFixtureGoals = (fixtureId: string, side: 'local' | 'visitante', valStr: string) => {
    setFixtures(prev => prev.map(f => {
      if (f.id === fixtureId) {
        const val = valStr === '' ? null : Math.max(0, parseInt(valStr) || 0);
        return {
          ...f,
          [side === 'local' ? 'golesLocal' : 'golesVisitante']: val
        };
      }
      return f;
    }));
  };

  const handleUpdateH2H = (h2hId: string, side: 'goalsA' | 'goalsB', val: number) => {
    setH2H(prev => prev.map(h => {
      if (h.id === h2hId) {
        return { ...h, [side]: Math.max(0, val) };
      }
      return h;
    }));
  };

  const resetAll = () => {
    // Restaurar valores por defecto reales
    setTeams([
      { id: 'racing', name: 'Racing de Santander', shortName: 'RAC', points: 79, gf: 86, gc: 60, dg: 26, color: '#16a34a', juegoLimpio: 78 },
      { id: 'deportivo', name: 'RC Deportivo', shortName: 'DEP', points: 77, gf: 64, gc: 42, dg: 22, color: '#2563eb', juegoLimpio: 84 },
      { id: 'almeria', name: 'UD Almería', shortName: 'ALM', points: 71, gf: 80, gc: 63, dg: 17, color: '#e11d48', juegoLimpio: 69 },
      { id: 'malaga', name: 'Málaga CF', shortName: 'MAL', points: 70, gf: 73, gc: 52, dg: 21, color: '#0ea5e9', juegoLimpio: 75 },
      { id: 'laspalmas', name: 'UD Las Palmas', shortName: 'LPA', points: 70, gf: 55, gc: 39, dg: 16, color: '#ffd200', juegoLimpio: 72 },
      { id: 'castellon', name: 'CD Castellón', shortName: 'CAS', points: 69, gf: 68, gc: 50, dg: 18, color: '#4b5563', juegoLimpio: 88 },
      { id: 'burgos', name: 'Burgos CF', shortName: 'BUR', points: 69, gf: 47, gc: 33, dg: 14, color: '#0f172a', juegoLimpio: 81 },
      { id: 'eibar', name: 'SD Eibar', shortName: 'EIB', points: 67, gf: 51, gc: 38, dg: 13, color: '#dc2626', juegoLimpio: 74 },
      { id: 'cadiz', name: 'Cádiz CF', shortName: 'CAD', points: 10, gf: 0, gc: 0, dg: 0, color: '#eab308', isExternal: true, juegoLimpio: 65 },
      { id: 'valladolid', name: 'Real Valladolid', shortName: 'VLL', points: 10, gf: 0, gc: 0, dg: 0, color: '#c084fc', isExternal: true, juegoLimpio: 70 },
      { id: 'zaragoza', name: 'Real Zaragoza', shortName: 'ZAR', points: 10, gf: 0, gc: 0, dg: 0, color: '#60a5fa', isExternal: true, juegoLimpio: 72 },
      { id: 'andorra', name: 'FC Andorra', shortName: 'AND', points: 10, gf: 0, gc: 0, dg: 0, color: '#a1a1aa', isExternal: true, juegoLimpio: 79 },
    ]);
    setH2H([
      // 1. Almería as Local
      { id: 'h1', teamA: 'almeria', teamB: 'andorra', goalsA: 3, goalsB: 2 },
      { id: 'h2', teamA: 'almeria', teamB: 'burgos', goalsA: 1, goalsB: 2 },
      { id: 'h3', teamA: 'almeria', teamB: 'cadiz', goalsA: 3, goalsB: 0 },
      { id: 'h4', teamA: 'almeria', teamB: 'castellon', goalsA: 1, goalsB: 0 },
      { id: 'h5', teamA: 'almeria', teamB: 'deportivo', goalsA: 1, goalsB: 2 },
      { id: 'h6', teamA: 'almeria', teamB: 'eibar', goalsA: 3, goalsB: 1 },
      { id: 'h7', teamA: 'almeria', teamB: 'laspalmas', goalsA: 1, goalsB: 2 },
      { id: 'h8', teamA: 'almeria', teamB: 'malaga', goalsA: 3, goalsB: 2 },
      { id: 'h9', teamA: 'almeria', teamB: 'racing', goalsA: 2, goalsB: 3 },
      { id: 'h10', teamA: 'almeria', teamB: 'zaragoza', goalsA: 4, goalsB: 2 },

      // 2. Andorra as Local
      { id: 'h11', teamA: 'andorra', teamB: 'almeria', goalsA: 1, goalsB: 2 },
      { id: 'h12', teamA: 'andorra', teamB: 'burgos', goalsA: 2, goalsB: 1 },
      { id: 'h13', teamA: 'andorra', teamB: 'cadiz', goalsA: 0, goalsB: 0 },
      { id: 'h14', teamA: 'andorra', teamB: 'castellon', goalsA: 1, goalsB: 3 },
      { id: 'h15', teamA: 'andorra', teamB: 'deportivo', goalsA: 1, goalsB: 0 },
      { id: 'h16', teamA: 'andorra', teamB: 'eibar', goalsA: 0, goalsB: 1 },
      { id: 'h17', teamA: 'andorra', teamB: 'laspalmas', goalsA: 5, goalsB: 1 },
      { id: 'h18', teamA: 'andorra', teamB: 'malaga', goalsA: 3, goalsB: 3 },
      { id: 'h19', teamA: 'andorra', teamB: 'racing', goalsA: 6, goalsB: 2 },
      { id: 'h20', teamA: 'andorra', teamB: 'valladolid', goalsA: 1, goalsB: 0 },
      { id: 'h21', teamA: 'andorra', teamB: 'zaragoza', goalsA: 2, goalsB: 1 },

      // 3. Burgos as Local
      { id: 'h22', teamA: 'burgos', teamB: 'almeria', goalsA: 0, goalsB: 0 },
      { id: 'h23', teamA: 'burgos', teamB: 'cadiz', goalsA: 1, goalsB: 1 },
      { id: 'h24', teamA: 'burgos', teamB: 'castellon', goalsA: 0, goalsB: 0 },
      { id: 'h25', teamA: 'burgos', teamB: 'deportivo', goalsA: 1, goalsB: 1 },
      { id: 'h26', teamA: 'burgos', teamB: 'eibar', goalsA: 1, goalsB: 0 },
      { id: 'h27', teamA: 'burgos', teamB: 'laspalmas', goalsA: 0, goalsB: 0 },
      { id: 'h28', teamA: 'burgos', teamB: 'malaga', goalsA: 2, goalsB: 1 },
      { id: 'h29', teamA: 'burgos', teamB: 'racing', goalsA: 0, goalsB: 2 },
      { id: 'h30', teamA: 'burgos', teamB: 'valladolid', goalsA: 0, goalsB: 1 },
      { id: 'h31', teamA: 'burgos', teamB: 'zaragoza', goalsA: 1, goalsB: 1 },

      // 4. Cádiz as Local
      { id: 'h32', teamA: 'cadiz', teamB: 'almeria', goalsA: 1, goalsB: 2 },
      { id: 'h33', teamA: 'cadiz', teamB: 'andorra', goalsA: 0, goalsB: 1 },
      { id: 'h34', teamA: 'cadiz', teamB: 'burgos', goalsA: 1, goalsB: 3 },
      { id: 'h35', teamA: 'cadiz', teamB: 'castellon', goalsA: 2, goalsB: 0 },
      { id: 'h36', teamA: 'cadiz', teamB: 'deportivo', goalsA: 0, goalsB: 1 },
      { id: 'h37', teamA: 'cadiz', teamB: 'eibar', goalsA: 1, goalsB: 0 },
      { id: 'h38', teamA: 'cadiz', teamB: 'laspalmas', goalsA: 1, goalsB: 2 },
      { id: 'h39', teamA: 'cadiz', teamB: 'malaga', goalsA: 0, goalsB: 3 },
      { id: 'h40', teamA: 'cadiz', teamB: 'racing', goalsA: 2, goalsB: 3 },
      { id: 'h41', teamA: 'cadiz', teamB: 'valladolid', goalsA: 0, goalsB: 0 },
      { id: 'h42', teamA: 'cadiz', teamB: 'zaragoza', goalsA: 0, goalsB: 1 },

      // 5. Castellón as Local
      { id: 'h43', teamA: 'castellon', teamB: 'almeria', goalsA: 2, goalsB: 0 },
      { id: 'h44', teamA: 'castellon', teamB: 'andorra', goalsA: 2, goalsB: 0 },
      { id: 'h45', teamA: 'castellon', teamB: 'burgos', goalsA: 3, goalsB: 1 },
      { id: 'h46', teamA: 'castellon', teamB: 'cadiz', goalsA: 1, goalsB: 1 },
      { id: 'h47', teamA: 'castellon', teamB: 'deportivo', goalsA: 2, goalsB: 0 },
      { id: 'h48', teamA: 'castellon', teamB: 'laspalmas', goalsA: 1, goalsB: 0 },
      { id: 'h49', teamA: 'castellon', teamB: 'malaga', goalsA: 2, goalsB: 1 },
      { id: 'h50', teamA: 'castellon', teamB: 'racing', goalsA: 1, goalsB: 3 },
      { id: 'h51', teamA: 'castellon', teamB: 'valladolid', goalsA: 0, goalsB: 1 },
      { id: 'h52', teamA: 'castellon', teamB: 'zaragoza', goalsA: 1, goalsB: 1 },

      // 6. Deportivo as Local
      { id: 'h53', teamA: 'deportivo', teamB: 'almeria', goalsA: 1, goalsB: 1 },
      { id: 'h54', teamA: 'deportivo', teamB: 'andorra', goalsA: 2, goalsB: 1 },
      { id: 'h55', teamA: 'deportivo', teamB: 'burgos', goalsA: 0, goalsB: 0 },
      { id: 'h56', teamA: 'deportivo', teamB: 'cadiz', goalsA: 2, goalsB: 2 },
      { id: 'h57', teamA: 'deportivo', teamB: 'castellon', goalsA: 1, goalsB: 3 },
      { id: 'h58', teamA: 'deportivo', teamB: 'eibar', goalsA: 1, goalsB: 0 },
      { id: 'h59', teamA: 'deportivo', teamB: 'malaga', goalsA: 1, goalsB: 1 },
      { id: 'h60', teamA: 'deportivo', teamB: 'racing', goalsA: 0, goalsB: 1 },
      { id: 'h61', teamA: 'deportivo', teamB: 'valladolid', goalsA: 1, goalsB: 1 },
      { id: 'h62', teamA: 'deportivo', teamB: 'zaragoza', goalsA: 2, goalsB: 1 },

      // 7. Eibar as Local
      { id: 'h63', teamA: 'eibar', teamB: 'almeria', goalsA: 1, goalsB: 0 },
      { id: 'h64', teamA: 'eibar', teamB: 'andorra', goalsA: 2, goalsB: 0 },
      { id: 'h65', teamA: 'eibar', teamB: 'burgos', goalsA: 0, goalsB: 0 },
      { id: 'h66', teamA: 'eibar', teamB: 'cadiz', goalsA: 3, goalsB: 1 },
      { id: 'h67', teamA: 'eibar', teamB: 'castellon', goalsA: 0, goalsB: 0 },
      { id: 'h68', teamA: 'eibar', teamB: 'deportivo', goalsA: 1, goalsB: 1 },
      { id: 'h69', teamA: 'eibar', teamB: 'laspalmas', goalsA: 3, goalsB: 1 },
      { id: 'h70', teamA: 'eibar', teamB: 'malaga', goalsA: 2, goalsB: 4 },
      { id: 'h71', teamA: 'eibar', teamB: 'racing', goalsA: 2, goalsB: 1 },
      { id: 'h72', teamA: 'eibar', teamB: 'valladolid', goalsA: 3, goalsB: 0 },
      { id: 'h73', teamA: 'eibar', teamB: 'zaragoza', goalsA: 1, goalsB: 2 },

      // 8. Las Palmas as Local
      { id: 'h74', teamA: 'laspalmas', teamB: 'almeria', goalsA: 0, goalsB: 1 },
      { id: 'h75', teamA: 'laspalmas', teamB: 'andorra', goalsA: 1, goalsB: 1 },
      { id: 'h76', teamA: 'laspalmas', teamB: 'burgos', goalsA: 0, goalsB: 0 },
      { id: 'h77', teamA: 'laspalmas', teamB: 'cadiz', goalsA: 1, goalsB: 0 },
      { id: 'h78', teamA: 'laspalmas', teamB: 'castellon', goalsA: 1, goalsB: 1 },
      { id: 'h79', teamA: 'laspalmas', teamB: 'deportivo', goalsA: 1, goalsB: 1 },
      { id: 'h80', teamA: 'laspalmas', teamB: 'eibar', goalsA: 3, goalsB: 1 },
      { id: 'h81', teamA: 'laspalmas', teamB: 'malaga', goalsA: 0, goalsB: 1 },
      { id: 'h82', teamA: 'laspalmas', teamB: 'racing', goalsA: 3, goalsB: 1 },
      { id: 'h83', teamA: 'laspalmas', teamB: 'valladolid', goalsA: 2, goalsB: 1 },
      { id: 'h84', teamA: 'laspalmas', teamB: 'zaragoza', goalsA: 1, goalsB: 1 },

      // 9. Málaga as Local
      { id: 'h85', teamA: 'malaga', teamB: 'almeria', goalsA: 2, goalsB: 1 },
      { id: 'h86', teamA: 'malaga', teamB: 'andorra', goalsA: 4, goalsB: 1 },
      { id: 'h87', teamA: 'malaga', teamB: 'burgos', goalsA: 3, goalsB: 0 },
      { id: 'h88', teamA: 'malaga', teamB: 'cadiz', goalsA: 0, goalsB: 1 },
      { id: 'h89', teamA: 'malaga', teamB: 'castellon', goalsA: 2, goalsB: 3 },
      { id: 'h90', teamA: 'malaga', teamB: 'deportivo', goalsA: 3, goalsB: 0 },
      { id: 'h91', teamA: 'malaga', teamB: 'eibar', goalsA: 1, goalsB: 1 },
      { id: 'h92', teamA: 'malaga', teamB: 'laspalmas', goalsA: 2, goalsB: 0 },
      { id: 'h93', teamA: 'malaga', teamB: 'racing', goalsA: 1, goalsB: 1 },
      { id: 'h94', teamA: 'malaga', teamB: 'valladolid', goalsA: 2, goalsB: 1 },
      { id: 'h95', teamA: 'malaga', teamB: 'zaragoza', goalsA: 3, goalsB: 3 },

      // 10. Racing as Local
      { id: 'h96', teamA: 'racing', teamB: 'almeria', goalsA: 5, goalsB: 1 },
      { id: 'h97', teamA: 'racing', teamB: 'andorra', goalsA: 1, goalsB: 2 },
      { id: 'h98', teamA: 'racing', teamB: 'burgos', goalsA: 1, goalsB: 0 },
      { id: 'h99', teamA: 'racing', teamB: 'castellon', goalsA: 3, goalsB: 1 },
      { id: 'h100', teamA: 'racing', teamB: 'deportivo', goalsA: 2, goalsB: 1 },
      { id: 'h101', teamA: 'racing', teamB: 'eibar', goalsA: 4, goalsB: 0 },
      { id: 'h102', teamA: 'racing', teamB: 'laspalmas', goalsA: 4, goalsB: 1 },
      { id: 'h103', teamA: 'racing', teamB: 'malaga', goalsA: 3, goalsB: 0 },
      { id: 'h104', teamA: 'racing', teamB: 'valladolid', goalsA: 4, goalsB: 1 },
      { id: 'h105', teamA: 'racing', teamB: 'zaragoza', goalsA: 2, goalsB: 3 },

      // 11. Valladolid as Local
      { id: 'h106', teamA: 'valladolid', teamB: 'almeria', goalsA: 3, goalsB: 1 },
      { id: 'h107', teamA: 'valladolid', teamB: 'andorra', goalsA: 0, goalsB: 1 },
      { id: 'h108', teamA: 'valladolid', teamB: 'burgos', goalsA: 0, goalsB: 1 },
      { id: 'h109', teamA: 'valladolid', teamB: 'cadiz', goalsA: 3, goalsB: 0 },
      { id: 'h110', teamA: 'valladolid', teamB: 'castellon', goalsA: 0, goalsB: 4 },
      { id: 'h111', teamA: 'valladolid', teamB: 'deportivo', goalsA: 0, goalsB: 2 },
      { id: 'h112', teamA: 'valladolid', teamB: 'eibar', goalsA: 0, goalsB: 1 },
      { id: 'h113', teamA: 'valladolid', teamB: 'laspalmas', goalsA: 0, goalsB: 1 },
      { id: 'h114', teamA: 'valladolid', teamB: 'malaga', goalsA: 1, goalsB: 1 },
      { id: 'h115', teamA: 'valladolid', teamB: 'racing', goalsA: 1, goalsB: 1 },
      { id: 'h116', teamA: 'valladolid', teamB: 'zaragoza', goalsA: 2, goalsB: 0 },

      // 12. Zaragoza as Local
      { id: 'h117', teamA: 'zaragoza', teamB: 'almeria', goalsA: 2, goalsB: 0 },
      { id: 'h118', teamA: 'zaragoza', teamB: 'andorra', goalsA: 1, goalsB: 3 },
      { id: 'h119', teamA: 'zaragoza', teamB: 'burgos', goalsA: 0, goalsB: 1 },
      { id: 'h120', teamA: 'zaragoza', teamB: 'cadiz', goalsA: 1, goalsB: 2 },
      { id: 'h121', teamA: 'zaragoza', teamB: 'castellon', goalsA: 0, goalsB: 0 },
      { id: 'h122', teamA: 'zaragoza', teamB: 'deportivo', goalsA: 0, goalsB: 2 },
      { id: 'h123', teamA: 'zaragoza', teamB: 'eibar', goalsA: 1, goalsB: 1 },
      { id: 'h124', teamA: 'zaragoza', teamB: 'laspalmas', goalsA: 1, goalsB: 2 },
      { id: 'h125', teamA: 'zaragoza', teamB: 'racing', goalsA: 0, goalsB: 1 },
      { id: 'h126', teamA: 'zaragoza', teamB: 'valladolid', goalsA: 1, goalsB: 3 }
    ]);
    setFixtures([
      { id: 'f1', local: 'castellon', visitante: 'eibar', golesLocal: null, golesVisitante: null },
      { id: 'f2', local: 'deportivo', visitante: 'laspalmas', golesLocal: null, golesVisitante: null },
      { id: 'f3', local: 'racing', visitante: 'cadiz', golesLocal: null, golesVisitante: null },
      { id: 'f4', local: 'almeria', visitante: 'valladolid', golesLocal: null, golesVisitante: null },
      { id: 'f5', local: 'zaragoza', visitante: 'malaga', golesLocal: null, golesVisitante: null },
      { id: 'f6', local: 'burgos', visitante: 'andorra', golesLocal: null, golesVisitante: null },
    ]);
    setSelectedFocusTeam('laspalmas');
  };

  // -------------------------------------------------------------------------
  // 6. Reportes especializados y consejos del modelo AI
  // -------------------------------------------------------------------------
  const focusStats = useMemo(() => {
    const statItem = simulationData.results.find(r => r.teamId === selectedFocusTeam);
    if (!statItem) return null;

    const pDir = (statItem.directo / statItem.totalScenarios) * 100;
    const pPlay = (statItem.playoff / statItem.totalScenarios) * 100;
    const pNo = (statItem.permanencia / statItem.totalScenarios) * 100;
    
    return {
      team: teams.find(t => t.id === selectedFocusTeam)!,
      pDir,
      pPlay,
      pNo
    };
  }, [simulationData, selectedFocusTeam, teams]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-laspalmas-blue selection:text-white pb-12">
      {/* -------------------------------------------------------------------------
          HEADER & HERO BAR (Clean Minimalism Aesthetics)
          ------------------------------------------------------------------------- */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-laspalmas-blue rounded-lg flex items-center justify-center text-white shrink-0 font-bold shadow-sm">
              <Trophy className="w-5 h-5 text-laspalmas-yellow shrink-0 animate-pulse" />
            </div>
            <div className="flex-1">
              <h1 id="app-title" className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2 flex-wrap mt-0.5">
                Calculadora de Ascenso <span className="text-laspalmas-blue bg-laspalmas-yellow border border-laspalmas-yellow/50 px-2 py-0.5 rounded-lg shadow-inner text-xs font-black tracking-normal self-center">UD Las Palmas</span> 💛💙
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden md:flex items-center gap-3 font-sans">
              <button
                onClick={resetAll}
                className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold text-slate-750 border border-slate-200 shadow-xs transition cursor-pointer"
                id="btn-reset-data"
              >
                <RefreshCw className="w-3.5 h-3.5 text-laspalmas-blue" />
                Restablecer Valores
              </button>
              <div className="text-xs bg-laspalmas-yellow/15 border border-laspalmas-yellow/40 px-3 py-2 rounded-lg text-slate-800 font-medium">
                Escenarios calculados:{' '}
                <strong className="text-laspalmas-blue font-mono text-sm">{simulationData.totalScenarios.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------------
          CORE FOCUS BOARD (Probabilidades predictivas en un entorno limpio)
          ------------------------------------------------------------------------- */}
      <div className="bg-gradient-to-b from-laspalmas-blue/5 to-slate-50/80 border-b border-slate-205">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Banner de la Afición UD Las Palmas */}
          <div className="mb-6 bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-105 border border-laspalmas-yellow/60 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-12 h-12 bg-laspalmas-blue text-laspalmas-yellow rounded-xl shadow-md ring-2 ring-laspalmas-yellow/50 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 animate-bounce text-laspalmas-yellow" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-amber-950 tracking-tight uppercase flex items-center gap-1.5 justify-center sm:justify-start">
                  ¡PÍO-PÍO! ESPÍRITU DE LA UNIÓN DEPORTIVA 💛💙
                </h2>
                <p className="text-xs text-amber-900 font-medium font-sans">
                  Portal de simulación y promedios probabilísticos exclusivo para seguidores de la <strong>UD Las Palmas</strong>. ¡Predice el ansiado ascenso a Primera!
                </p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedFocusTeam('laspalmas')}
              className="px-4 py-2 bg-laspalmas-blue hover:bg-[#002f83] active:bg-laspalmas-navy text-laspalmas-yellow font-bold rounded-xl text-xs transition cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-laspalmas-yellow animate-pulse" />
              Enfocar mi UDLP
            </button>
          </div>

          <div className="font-semibold text-xs tracking-wider uppercase text-laspalmas-blue mb-2.5 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-laspalmas-blue font-bold" />
            Predictor de Alta Precisión Estocástica
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Selector de foco */}
            <div className="md:col-span-3">
              <label htmlFor="focus-team-select" className="block text-xs font-semibold text-slate-500 mb-1.5">
                Selecciona equipo para enfoque técnico:
              </label>
              <select
                id="focus-team-select"
                value={selectedFocusTeam}
                onChange={(e) => setSelectedFocusTeam(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-laspalmas-blue/50 focus:border-laspalmas-blue transition shadow-xs cursor-pointer"
              >
                {teams.filter(t => !t.isExternal).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Métricas del equipo de foco */}
            {focusStats && (
              <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Ascenso Directo Meter */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-laspalmas-blue/30 transition">
                  <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-laspalmas-blue/5 group-hover:scale-110 transition duration-300">
                    <TrendingUp className="w-24 h-24" />
                  </div>
                  <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                    <span>Ascenso Directo</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">Puestos 1-2</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {focusStats.pDir.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-laspalmas-blue h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${focusStats.pDir}%` }}
                    />
                  </div>
                </div>

                {/* Playoff Meter */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-laspalmas-blue/30 transition">
                  <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-slate-400/5 group-hover:scale-110 transition duration-300">
                    <Award className="w-24 h-24" />
                  </div>
                  <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                    <span>Playoff de Promoción</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-bold">Puestos 3-6</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {focusStats.pPlay.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${focusStats.pPlay}%` }}
                    />
                  </div>
                </div>

                {/* No Ascenso Meter */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-laspalmas-blue/30 transition">
                  <div className="absolute right-0 bottom-0 translate-y-2 translate-x-2 text-slate-400/5 group-hover:scale-110 transition duration-300">
                    <Flame className="w-24 h-24" />
                  </div>
                  <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                    <span>Permanecer en Segunda</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-bold font-semibold font-mono">Puestos 7+</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {focusStats.pNo.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-slate-400 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${focusStats.pNo}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------
          MAIN NAVIGATION TABS
          ------------------------------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2 scrollbar-none font-sans">
          <button
            onClick={() => setActiveTab('simulador')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'simulador' 
                ? 'border-laspalmas-blue text-laspalmas-blue bg-laspalmas-yellow/15 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
            id="tab-simulador"
          >
            <Sliders className="w-4 h-4 text-laspalmas-blue" />
            Simulador y Variaciones
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'h2h' 
                ? 'border-laspalmas-blue text-laspalmas-blue bg-laspalmas-yellow/15 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
            id="tab-h2h"
          >
            <Calendar className="w-4 h-4 text-laspalmas-blue" />
            Enfrentamientos Directos (H2H)
          </button>
          <button
            onClick={() => setActiveTab('reglamento')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'reglamento' 
                ? 'border-laspalmas-blue text-laspalmas-blue bg-laspalmas-yellow/15 font-bold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
            }`}
            id="tab-reglamento"
          >
            <BookOpen className="w-4 h-4 text-laspalmas-blue" />
            Reglamento Desempates
          </button>
        </div>

        {/* -------------------------------------------------------------------------
            TAB 1: SIMULADOR & VARIACIONES (Main Workspace)
            ------------------------------------------------------------------------- */}
        {activeTab === 'simulador' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: Partidos Clave Restantes (Locks) (5/12 width) */}
            <div className="lg:col-span-5 space-y-6 select-none">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-laspalmas-blue" />
                    Partidos Clave Restantes (Locks)
                  </h2>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-550 border border-amber-200 flex items-center gap-1 font-bold animate-pulse-subtle">
                    <Flame className="w-3 h-3 animate-pulse" />
                    Interactivos
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 leading-relaxed font-light font-sans">
                  Inserta los <strong>goles previstos</strong> para cada duelo clave. Si dejas las casillas en blanco, el motor simulará automáticamente todos los posibles resultados (1X2) combinando los escenarios restantes.
                </p>

                <div className="flex flex-col gap-4">
                  {fixtures.map(f => {
                    const localTeam = teams.find(t => t.id === f.local)!;
                    const visitorTeam = teams.find(t => t.id === f.visitante)!;
                    const isLocked = f.golesLocal !== null && f.golesVisitante !== null;
                    
                    let matchOutcomeBadge = null;
                    if (isLocked) {
                      if ((f.golesLocal ?? 0) > (f.golesVisitante ?? 0)) {
                        matchOutcomeBadge = (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Gana {localTeam?.name} (1)
                          </span>
                        );
                      } else if ((f.golesLocal ?? 0) < (f.golesVisitante ?? 0)) {
                        matchOutcomeBadge = (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            Gana {visitorTeam?.name} (2)
                          </span>
                        );
                      } else {
                        matchOutcomeBadge = (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Empate (X)
                          </span>
                        );
                      }
                    } else {
                      matchOutcomeBadge = (
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-laspalmas-blue/10 text-laspalmas-blue border border-laspalmas-blue/20 animate-pulse">
                          Simulando Caminos (1X2)
                        </span>
                      );
                    }

                    return (
                      <div 
                        key={f.id} 
                        className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:shadow-sm transition duration-200 ${
                          isLocked 
                            ? 'bg-amber-50/10 border-amber-300 shadow-sm' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                          <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider font-mono">
                            Jornada 42
                          </span>
                          {matchOutcomeBadge}
                        </div>

                        {/* Interactive Goals Picker Grid */}
                        <div className="flex items-center justify-between gap-4 py-1">
                          {/* Local side */}
                          <div className="flex items-center justify-between gap-2.5 w-[42%]">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: localTeam?.color }} 
                              />
                              <span className="font-bold text-xs text-slate-700 truncate">{localTeam?.shortName}</span>
                            </div>
                            <input
                              type="number"
                              placeholder="goles"
                              value={f.golesLocal !== null ? f.golesLocal : ''}
                              onChange={(e) => handleUpdateFixtureGoals(f.id, 'local', e.target.value)}
                              className="w-11 h-9 bg-white border border-slate-200 text-center font-mono font-bold text-sm text-slate-800 rounded-lg shadow-inner focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none placeholder-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>

                          {/* Middle VS */}
                          <div className="flex flex-col items-center shrink-0">
                            <span className="text-[10px] text-slate-400 font-bold tracking-tight font-mono">VS</span>
                            {isLocked && (
                              <button 
                                onClick={() => {
                                  handleUpdateFixtureGoals(f.id, 'local', '');
                                  handleUpdateFixtureGoals(f.id, 'visitante', '');
                                }}
                                className="text-[9px] text-red-500 hover:text-red-650 font-bold hover:underline mt-1 cursor-pointer"
                              >
                                Limpiar
                              </button>
                            )}
                          </div>

                          {/* Visitor side */}
                          <div className="flex items-center justify-between gap-2.5 w-[42%] text-right">
                            <input
                              type="number"
                              placeholder="goles"
                              value={f.golesVisitante !== null ? f.golesVisitante : ''}
                              onChange={(e) => handleUpdateFixtureGoals(f.id, 'visitante', e.target.value)}
                              className="w-11 h-9 bg-white border border-slate-200 text-center font-mono font-bold text-sm text-slate-800 rounded-lg shadow-inner focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none placeholder-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <div className="flex items-center gap-1.5 justify-end min-w-0">
                              <span className="font-bold text-xs text-slate-700 truncate">{visitorTeam?.shortName}</span>
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                style={{ backgroundColor: visitorTeam?.color }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Clasificación Virtual (7/12 width) */}
            <div className="lg:col-span-7 space-y-6 select-none">
              

              {/* Tabla de clasificación interactiva con zonas de ascenso */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-laspalmas-blue" />
                    Tabla de Posiciones Virtual
                  </h2>
                  <span className="text-[10px] uppercase font-mono bg-laspalmas-blue/10 text-laspalmas-blue border border-laspalmas-blue/20 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                    <TrendingUp className="w-3 h-3" />
                    Lógica RFEF
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                        <th className="py-2.5 px-3">Pos</th>
                        <th className="py-2.5 px-3">Equipo</th>
                        <th className="py-2.5 px-3 text-right">Pts</th>
                        <th className="py-2.5 px-3 text-right">GF</th>
                        <th className="py-2.5 px-3 text-right">GC</th>
                        <th className="py-2.5 px-3 text-right">DG</th>
                        <th className="py-2.5 px-3 text-right text-slate-500 hover:text-laspalmas-blue cursor-help" title="Desempate por Juego Limpio (Menos puntos es mejor)">JL</th>
                        <th className="py-2.5 px-3 text-right text-laspalmas-blue">Ascenso %</th>
                        <th className="py-2.5 px-3 text-right text-blue-700">Playoff %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      <AnimatePresence initial={false}>
                        {currentClassification.map((team, index) => {
                          const pos = index + 1;
                          const specRes = simulationData.results.find(r => r.teamId === team.id);
                          const pctDirecto = specRes ? (specRes.directo / specRes.totalScenarios) * 100 : 0;
                          const pctPlayoff = specRes ? (specRes.playoff / specRes.totalScenarios) * 100 : 0;
                          const isLasPalmas = team.id === 'laspalmas';
                          
                          // Determinar color de zona
                          let zoneColorLabel = "bg-slate-105 text-slate-500 border border-slate-200 font-mono";
                          if (pos <= 2) zoneColorLabel = "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold";
                          else if (pos <= 6) zoneColorLabel = "bg-blue-50 text-blue-700 border border-blue-200 font-bold";

                          return (
                            <motion.tr 
                              key={team.id} 
                              layout
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                mass: 0.8
                              }}
                              className={`transition-colors duration-200 ${
                                isLasPalmas 
                                  ? 'bg-laspalmas-yellow/15 font-bold hover:bg-laspalmas-yellow/25 border-y border-laspalmas-yellow/40' 
                                  : 'hover:bg-slate-50/70'
                              }`}
                            >
                              <td className="py-3 px-3">
                                <span className={`w-5.5 h-5.5 font-bold rounded-lg flex items-center justify-center font-mono ${zoneColorLabel}`}>
                                  {pos}
                                </span>
                              </td>
                              <td className={`py-3 px-3 font-semibold ${isLasPalmas ? 'text-amber-955 font-bold' : 'text-slate-900'}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                                  <span className="flex items-center gap-1.5">
                                    {team.name}
                                    {isLasPalmas && (
                                      <span className="text-[8px] uppercase font-mono bg-yellow-400 text-yellow-905 font-extrabold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap animate-pulse">
                                        UDLP
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{team.points}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-500">{team.gf}</td>
                              <td className="py-3 px-3 text-right font-mono text-slate-500">{team.gc}</td>
                              <td className="py-3 px-3 text-right font-mono font-medium text-slate-600">
                                {team.dg > 0 ? `+${team.dg}` : team.dg}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-500 hover:text-laspalmas-blue font-medium" title={`Puntos Juego Limpio: ${team.juegoLimpio} (menor es mejor)`}>
                                {team.juegoLimpio}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-emerald-650">
                                {pctDirecto.toFixed(1)}%
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-blue-650">
                                {pctPlayoff.toFixed(1)}%
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Leyenda aclaratoria */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-500 font-medium font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
                    Puestos 1-2: Ascenso Directo
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" />
                    Puestos 3-6: Playoffs de Promoción
                  </div>
                  <div className="flex items-center gap-1.5 text-laspalmas-blue">
                    <Info className="w-3.5 h-3.5" />
                    Ordenación calculada con duelos head-to-head en directo.
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            TAB 2: CONFIGURACIÓN H2H (Direct matches values)
            ------------------------------------------------------------------------- */}
        {activeTab === 'h2h' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 select-none font-sans">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-laspalmas-blue" />
                Duelos Particulares del Campeonato (H2H)
              </h2>
              <span className="text-xs bg-laspalmas-blue/10 border border-laspalmas-blue/20 px-3 py-1 rounded text-laspalmas-blue font-mono font-bold">
                Actualización en Caliente
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed font-light font-sans">
              Consulta los marcadores oficiales de los enfrentamientos de ida y vuelta disputados a lo largo de la temporada. Estos datos históricos son definitivos y se utilizan para romper el empate directo si dos o más equipos terminan con idéntica puntuación.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {h2h.map(m => {
                const teamA = teams.find(t => t.id === m.teamA)!;
                const teamB = teams.find(t => t.id === m.teamB)!;
                
                return (
                  <div 
                    key={m.id} 
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Resultado Oficial
                      </span>
                      <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded font-medium font-mono flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        Dato Final
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-1/2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teamA?.color }} />
                        <span className="text-xs font-bold text-slate-700 truncate">{teamA?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 w-1/2 justify-end text-right">
                        <span className="text-xs font-bold text-slate-700 truncate">{teamB?.name}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teamB?.color }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold">Goles local</label>
                        <div className="w-full bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs rounded py-1 px-2.5 font-bold cursor-not-allowed select-none">
                          {m.goalsA}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1 uppercase font-semibold text-right">Goles visitante</label>
                        <div className="w-full bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs rounded py-1 px-2.5 font-bold text-right cursor-not-allowed select-none">
                          {m.goalsB}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            TAB 3: REGLAMENTO DE DESEMPATES (RFEF Rulebook)
            ------------------------------------------------------------------------- */}
        {activeTab === 'reglamento' && (
          <div className="space-y-6 font-sans">
            {/* Header intro */}
            <div className="bg-gradient-to-r from-laspalmas-blue via-slate-900 to-laspalmas-navy rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
                <BookOpen className="w-48 h-48 animate-pulse text-laspalmas-yellow" />
              </div>
              <div className="max-w-3xl relative z-10">
                <span className="bg-laspalmas-yellow/20 border border-laspalmas-yellow/40 text-laspalmas-yellow text-[10.5px] uppercase font-bold px-3 py-1 rounded-full font-mono tracking-wider">
                  Real Federación Española de Fútbol
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 text-white">
                  Reglamento Oficial de Desempates
                </h2>
                <p className="text-white/80 text-sm mt-2 leading-relaxed font-light">
                  Directiva oficial del Reglamento General de la RFEF aplicable para dilucidar el orden y clasificación final en caso de igualdad de puntos en la competición de Segunda División (LaLiga Hypermotion). Esta calculadora implementa cada criterio de manera automática y en tiempo real.
                </p>
              </div>
            </div>

            {/* Content layout: bento style cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Empate entre DOS clubes */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-laspalmas-blue/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-laspalmas-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Empate Simple</h3>
                      <p className="text-[11px] text-slate-400">Igualdad de puntos entre dos clubes</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Se resuelve de forma excluyente y consecutiva según el siguiente orden:
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Diferencia de Goles Particular (H2H)</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mayor diferencia entre goles anotados y recibidos en los partidos disputados entre ellos.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Diferencia de Goles General</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mayor diferencia entre goles anotados y recibidos en todo el campeonato (<span className="font-mono text-slate-600">DG</span>).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Goles a Favor General</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mayor número de goles marcados en la competición global (<span className="font-mono text-slate-600">GF</span>).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">4</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Juego Limpio (Deportividad)</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mejor clasificación de juego limpio: menos tarjetas, expulsiones y sanciones registradas (<span className="font-mono text-slate-600 font-bold text-laspalmas-blue">JL</span>).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">5</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Partido Desempate</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Disputa de un partido en campo neutral designado por la RFEF.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 block mb-0.5">Nota del Simulador:</span>
                  Puedes ajustar los marcadores H2H de ida y vuelta en la pestaña correspondiente para romper empates directos de inmediato. En la tabla se muestra como la columna <strong className="text-slate-700 font-bold">JL</strong>.
                </div>
              </div>

              {/* Card 2: Empate múltiple */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-laspalmas-blue/10 flex items-center justify-center">
                      <Sliders className="w-5 h-5 text-laspalmas-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Empate Múltiple</h3>
                      <p className="text-[11px] text-slate-400">Igualdad de puntos entre 3 o más clubes</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Se establece una liguilla ficticia contabilizando únicamente los partidos disputados entre sí:
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-laspalmas-blue/10 flex items-center justify-center text-[10px] font-mono text-laspalmas-blue font-bold shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Puntos en Mini-Liga</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Puntuación sumada considerando única y exclusivamente los enfrentamientos particulares directos.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-laspalmas-blue/10 flex items-center justify-center text-[10px] font-mono text-laspalmas-blue font-bold shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Diferencia de Goles Mini-Liga</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mayor diferencia de goles anotados y recibidos restringido a los partidos de esta mini-liga.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-laspalmas-blue/10 flex items-center justify-center text-[10px] font-mono text-laspalmas-blue font-bold shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Diferencia de Goles General</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Si persiste empate tras la mini-liga, desempatará la diferencia general de la competición (<span className="font-mono text-slate-600">DG</span>).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-laspalmas-blue/10 flex items-center justify-center text-[10px] font-mono text-laspalmas-blue font-bold shrink-0 mt-0.5">4</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Goles a Favor General</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mayor cantidad de goles totales marcados por el equipo en la liga completa (<span className="font-mono text-slate-600">GF</span>).</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-laspalmas-blue/10 flex items-center justify-center text-[10px] font-mono text-laspalmas-blue font-bold shrink-0 mt-0.5">5</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Juego Limpio General</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Mejor clasificación de Juego Limpio oficial en la temporada completa (<span className="font-mono text-slate-600">JL</span>).</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-laspalmas-yellow/10 rounded-xl p-3 border border-laspalmas-yellow/30 text-[11px] text-amber-955">
                  <span className="font-semibold text-amber-950 block mb-0.5">Algoritmo RFEF Solver:</span>
                  El simulador calcula recursivamente las sub-liguillas de manera matemática para todos los equipos en igualdad de condiciones de forma automática.
                </div>
              </div>

              {/* Card 3: Play Off */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-laspalmas-blue/10 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-laspalmas-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Play Off por el Ascenso</h3>
                      <p className="text-[11px] text-slate-400">Eliminatorias a doble partido directo</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Normativa exclusiva para las eliminatorias de ida y vuelta para decidir la tercera plaza de ascenso:
                  </p>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Diferencia de Goles Global</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Se computan goles anotados y recibidos en ambos encuentros. No existe la regla de valor doble del gol de visitante.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-mono text-slate-650 font-bold shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-bold text-slate-700 text-xs">Prórroga de 30 Minutos</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">En caso de empate neto en el global, se disputa un tiempo extra de dos partes de 15 minutos al acabar el partido de vuelta.</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-laspalmas-blue/10 flex items-center justify-center text-[10px] font-mono text-laspalmas-blue font-bold shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-bold text-laspalmas-blue text-xs">Sin Tanda de Penaltis</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Si la prórroga vuelve a concluir con empate, <strong className="text-laspalmas-blue font-bold">quedará vencedor el equipo con mejor puesto en la fase regular</strong>.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-emerald-50 rounded-xl p-3 border border-emerald-100 text-[11px] text-emerald-800">
                  <span className="font-semibold text-emerald-900 block mb-0.5">Estadística de Simulación:</span>
                  En el simulador, el porcentaje de éxito de play-off simula de forma exacta estas ventajas deportivas basadas en la posición regular final.
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------------------
          FOOTER AREA
          ------------------------------------------------------------------------- */}
      <footer className="mt-16 border-t border-slate-200 py-8 text-center text-xs text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Simulador de Ascenso Segunda División. Desarrollado por Aitor Santana.</p>
          <p className="mt-1.5 text-[10px] text-slate-400">
            Esta calculadora realiza un análisis estadístico exacto de fuerza bruta resolviendo los escenarios posibles para los partidos restantes indicados.
          </p>
        </div>
      </footer>
    </div>
  );
}
