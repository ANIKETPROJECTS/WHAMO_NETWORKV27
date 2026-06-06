import { useState } from 'react';
import { X, BookOpen, Layers, Link2, Table2, FileSpreadsheet, Play, FileText, Keyboard, HelpCircle, ChevronRight, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'getting-started',   icon: <BookOpen className="w-4 h-4" />,       label: 'Getting Started'     },
  { id: 'elements',          icon: <Layers className="w-4 h-4" />,          label: 'Network Elements'    },
  { id: 'connections',       icon: <Link2 className="w-4 h-4" />,           label: 'Connections'         },
  { id: 'flex-table',        icon: <Table2 className="w-4 h-4" />,          label: 'Flex Table'          },
  { id: 'excel',             icon: <FileSpreadsheet className="w-4 h-4" />, label: 'Excel Import/Export' },
  { id: 'simulation',        icon: <Play className="w-4 h-4" />,            label: 'Running Simulations' },
  { id: 'files',             icon: <FileText className="w-4 h-4" />,        label: 'INP & OUT Files'     },
  { id: 'shortcuts',         icon: <Keyboard className="w-4 h-4" />,        label: 'Keyboard Shortcuts'  },
  { id: 'troubleshooting',   icon: <HelpCircle className="w-4 h-4" />,      label: 'Troubleshooting'     },
];

// ─── PDF generation ───────────────────────────────────────────────────────────
function downloadPDF() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const PW = 210;
  const PH = 297;
  const ML = 20;
  const MR = 20;
  const TW = PW - ML - MR;

  let pageNum = 1;

  // ── helpers ────────────────────────────────────────────────────────────────
  function newPage() {
    doc.addPage();
    pageNum++;
    addPageNumber();
  }

  function addPageNumber() {
    if (pageNum < 3) return; // no number on cover/toc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`${pageNum - 2}`, PW / 2, PH - 10, { align: 'center' });
    doc.text('WHAMO Network Designer — User Manual', ML, PH - 10);
    doc.setTextColor(0, 0, 0);
  }

  function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  }

  // Writes text and returns new y position; auto-page-breaks
  function writeLines(lines: string[], x: number, startY: number, fontSize: number, color: [number, number, number] = [60, 60, 60]): number {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lineH = fontSize * 0.45;
    let y = startY;
    for (const line of lines) {
      if (y > PH - 25) { newPage(); y = 30; }
      doc.text(line, x, y);
      y += lineH;
    }
    return y;
  }

  function sectionHeading(title: string, y: number): number {
    if (y > PH - 40) { newPage(); y = 30; }
    doc.setFillColor(26, 115, 232);
    doc.rect(ML, y - 5, TW, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(title, ML + 3, y + 1.5);
    doc.setTextColor(0, 0, 0);
    return y + 12;
  }

  function subHeading(title: string, y: number): number {
    if (y > PH - 35) { newPage(); y = 30; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(title, ML, y);
    doc.setDrawColor(26, 115, 232);
    doc.line(ML, y + 1.5, ML + doc.getTextWidth(title), y + 1.5);
    doc.setTextColor(60, 60, 60);
    return y + 7;
  }

  function para(text: string, y: number, bold = false): number {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = wrapText(text, TW, 10);
    return writeLines(lines, ML, y, 10) + 3;
  }

  function noteBox(text: string, y: number, warn = false): number {
    if (y > PH - 30) { newPage(); y = 30; }
    const lines = wrapText(text, TW - 8, 9.5);
    const boxH = lines.length * 4.3 + 5;
    doc.setFillColor(warn ? 255 : 235, warn ? 251 : 245, warn ? 205 : 254);
    doc.setDrawColor(warn ? 217 : 26, warn ? 119 : 115, warn ? 6 : 232);
    doc.roundedRect(ML, y, TW, boxH, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(warn ? 120 : 26, warn ? 60 : 70, warn ? 6 : 150);
    doc.text(warn ? '⚠  Note' : 'ℹ  Info', ML + 3, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    let ly = y + 8;
    for (const l of lines) { doc.text(l, ML + 3, ly); ly += 4.3; }
    return y + boxH + 4;
  }

  function stepList(steps: string[], y: number): number {
    for (let i = 0; i < steps.length; i++) {
      if (y > PH - 25) { newPage(); y = 30; }
      doc.setFillColor(26, 115, 232);
      doc.circle(ML + 2.5, y - 1.5, 2.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(String(i + 1), ML + 2.5, y - 0.5, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(steps[i], TW - 8);
      doc.text(lines, ML + 7, y);
      y += lines.length * 4.5 + 1.5;
    }
    return y + 2;
  }

  function elementCard(name: string, desc: string, fields: string[], y: number): number {
    if (y > PH - 40) { newPage(); y = 30; }
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(200, 210, 220);
    const descLines = doc.splitTextToSize(desc, TW - 6);
    const fieldText = fields.join('  ·  ');
    const fieldLines = doc.splitTextToSize(fieldText, TW - 6);
    const boxH = 7 + descLines.length * 4.5 + (fields.length ? fieldLines.length * 4 + 4 : 0);
    doc.roundedRect(ML, y, TW, boxH, 2, 2, 'FD');
    doc.setFillColor(26, 115, 232);
    doc.roundedRect(ML + 2, y + 2, doc.getStringUnitWidth(name) * 10 * 0.352 + 4, 5, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(name, ML + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 60, 60);
    let ly = y + 10;
    for (const l of descLines) { doc.text(l, ML + 3, ly); ly += 4.5; }
    if (fields.length) {
      doc.setFontSize(8.5);
      doc.setTextColor(100, 120, 140);
      for (const l of fieldLines) { doc.text(l, ML + 3, ly); ly += 4; }
    }
    return y + boxH + 3;
  }

  function kbTable(rows: Array<[string[], string]>, y: number): number {
    const colW = [70, TW - 70];
    if (y > PH - 40) { newPage(); y = 30; }
    // header
    doc.setFillColor(241, 245, 249);
    doc.rect(ML, y - 4, TW, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(80, 100, 120);
    doc.text('Shortcut', ML + 2, y);
    doc.text('Action', ML + colW[0] + 2, y);
    y += 4;
    for (const [keys, action] of rows) {
      if (y > PH - 20) { newPage(); y = 30; }
      doc.setDrawColor(230, 235, 240);
      doc.line(ML, y, ML + TW, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(50, 70, 100);
      doc.text(keys.join(' + '), ML + 2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(action, ML + colW[0] + 2, y + 4);
      y += 7;
    }
    return y + 4;
  }

  // ── COVER PAGE ─────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PW, PH, 'F');

  doc.setFillColor(26, 115, 232);
  doc.rect(0, PH * 0.42, PW, 55, 'F');

  // Top accent stripe
  doc.setFillColor(26, 115, 232);
  doc.rect(0, 0, PW, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.text('WHAMO', PW / 2, 70, { align: 'center' });

  doc.setFontSize(22);
  doc.setTextColor(147, 197, 253);
  doc.text('Network Designer', PW / 2, 84, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(200, 220, 255);
  doc.text('User Manual', PW / 2, 95, { align: 'center' });

  // Divider line
  doc.setDrawColor(26, 115, 232);
  doc.setLineWidth(0.5);
  doc.line(ML, 103, PW - ML, 103);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text('Hydraulic Transient Analysis Tool', PW / 2, 112, { align: 'center' });
  doc.text('Water Hammer & Mass Oscillation', PW / 2, 120, { align: 'center' });

  // Badge area
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(PW / 2 - 40, 135, 80, 24, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 115, 232);
  doc.text('VERSION 1.0', PW / 2, 145, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }), PW / 2, 153, { align: 'center' });

  // Bottom section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Complete Reference Guide', PW / 2, PH * 0.42 + 14, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  const coverTopics = [
    'Network Elements  ·  Connections  ·  Simulations',
    'Excel Import/Export  ·  INP/OUT Files  ·  Keyboard Shortcuts',
  ];
  let cy = PH * 0.42 + 23;
  for (const t of coverTopics) { doc.text(t, PW / 2, cy, { align: 'center' }); cy += 7; }

  doc.setFontSize(8);
  doc.setTextColor(100, 120, 150);
  doc.text('WHAMO Network Designer  ·  All rights reserved', PW / 2, PH - 12, { align: 'center' });

  // ── TABLE OF CONTENTS ──────────────────────────────────────────────────────
  newPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, PW, PH, 'F');

  doc.setFillColor(26, 115, 232);
  doc.rect(0, 0, PW, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('TABLE OF CONTENTS', ML, 9.5);

  const tocItems = [
    ['01', 'Getting Started', 'Creating a project, opening, saving, undo/redo'],
    ['02', 'Network Elements', 'Reservoirs, nodes, junctions, surge tanks, flow boundaries, pumps, check valves, turbines'],
    ['03', 'Connections', 'Drawing conduits, pump/valve/turbine links, conduit properties'],
    ['04', 'Flex Table', 'Spreadsheet editor, filters, units, T/H schedules, material'],
    ['05', 'Excel Import/Export', 'Single-tab and multi-sheet workbook workflows'],
    ['06', 'Running Simulations', 'Parameters, output requests, generating .OUT files'],
    ['07', 'INP & OUT Files', 'Generating .INP, viewing .OUT, visualization tool'],
    ['08', 'Keyboard Shortcuts', 'Canvas, Flex Table, and ReactFlow control shortcuts'],
    ['09', 'Troubleshooting', 'Common issues and solutions'],
  ];

  let ty = 28;
  for (const [num, title, desc] of tocItems) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220, 228, 238);
    doc.roundedRect(ML, ty, TW, 16, 2, 2, 'FD');
    doc.setFillColor(26, 115, 232);
    doc.roundedRect(ML + 2, ty + 2, 10, 12, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(num, ML + 7, ty + 9.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 30, 50);
    doc.text(title, ML + 16, ty + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 115, 135);
    const descL = doc.splitTextToSize(desc, TW - 20);
    doc.text(descL[0], ML + 16, ty + 11.5);
    ty += 20;
  }

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(150, 160, 175);
  doc.text('This document was generated automatically from the WHAMO Network Designer help system.', ML, PH - 14);

  // ── SECTION 1: GETTING STARTED ─────────────────────────────────────────────
  newPage();
  let y = sectionHeading('1.  Getting Started', 22);
  y = para('WHAMO Network Designer lets you visually build water distribution networks and export them for hydraulic simulation using the WHAMO engine.', y);
  y += 2;
  y = subHeading('Creating a New Project', y);
  y = stepList([
    'Click New in the title bar to create a blank project.',
    'Enter a project name in the centre field of the title bar.',
    'Add elements using the INSERT ribbon (Reservoir, Node, Junction, etc.).',
    'Connect elements by hovering a node until the green handle appears, then dragging to another node.',
    'Click Save As to persist the project to the server.',
  ], y);
  y = subHeading('Opening an Existing Project', y);
  y = stepList([
    'Click Open in the title bar.',
    'Select a project from the Projects list panel.',
    'The canvas, properties, and all settings are restored automatically.',
  ], y);
  y = subHeading('Saving', y);
  y = para('Use Save to overwrite the current project, or Save As to create a new revision. Projects are stored on the server and remain available after logging out.', y);
  y = noteBox('All element property changes are tracked with Undo/Redo (up to 50 steps). Use Ctrl+Z and Ctrl+Y to navigate the history.', y);

  // ── SECTION 2: NETWORK ELEMENTS ────────────────────────────────────────────
  newPage();
  y = sectionHeading('2.  Network Elements', 22);
  y = para('Each element in WHAMO represents a physical hydraulic component. Click any INSERT ribbon button to add an element to the canvas.', y);
  y += 2;
  y = elementCard('Reservoir', 'Fixed or schedule-driven hydraulic boundary. Provides a constant or time-varying head.', ['Label', 'Elevation (m/ft)', 'Mode (Fixed/Schedule)', 'H-Schedule #', 'Loss coefficient'], y);
  y = elementCard('Node', 'Basic junction point in the network. Used wherever pipes meet without special behaviour.', ['Label', 'Elevation (m/ft)', 'Node number'], y);
  y = elementCard('Junction', 'Demand or tee junction with optional demand flow. Use for lateral off-takes.', ['Label', 'Elevation', 'Demand (m³/s or ft³/s)'], y);
  y = elementCard('Surge Tank', 'Open or closed surge vessel. Models water-hammer suppression chambers.', ['Label', 'Tank Top / Bottom', 'Initial Water Level', 'Riser Diameter', 'Area, Shape (E/A pairs)'], y);
  y = elementCard('Flow BC', 'Flow boundary condition. Injects or extracts a prescribed flow rate, optionally time-varying.', ['Label', 'Flow rate (Q)', 'Mode', 'Q-Schedule #'], y);
  y = elementCard('Pump', 'Link element placed on a conduit to represent a pump. Requires a pump characteristic curve (P-Char).', ['Label', 'Speed ratio', 'Status (ON/OFF)', 'P-Char data'], y);
  y = elementCard('Check Valve', 'Link element that only allows forward flow. Closes instantly when flow reverses.', ['Label', 'Loss coefficient'], y);
  y = elementCard('Turbine', 'Link element representing a hydraulic turbine. Supports TURBGOV and EMERGENCY closure modes.', ['Label', 'Mode', 'Gate schedule (V-Schedule)', 'Speed, Inertia'], y);
  y = subHeading('Conduits (Pipes)', y);
  y = para('Conduits are drawn automatically when you connect two elements. They carry flow between nodes. Key properties include length, diameter, celerity (wave speed), and friction factor. Dummy pipes are zero-resistance conduits used to represent very short physical connections.', y);

  // ── SECTION 3: CONNECTIONS ─────────────────────────────────────────────────
  newPage();
  y = sectionHeading('3.  Connections (Conduits)', 22);
  y = para('Every pair of connected elements is linked by a conduit. Drawing and editing conduits is the primary way to build your network topology.', y);
  y += 2;
  y = subHeading('Drawing a Conduit', y);
  y = stepList([
    'Hover over any element node until a green connection handle appears on its edge.',
    'Click and drag from the handle to the target element.',
    'Release the mouse over the target — a conduit (pipe) is created automatically.',
    'The conduit appears in the Flex Table under the Conduit tab where you can set its properties.',
  ], y);
  y = subHeading('Pump / Check Valve / Turbine Links', y);
  y = stepList([
    'Click the Pump / Check Valve / Turbine button in the INSERT ribbon. The button turns blue to activate link-drawing mode.',
    'Hover over a source element and drag to a target element.',
    'The selected link type is created as a conduit with the special element type set.',
    'Click the active button again to cancel link-drawing mode.',
  ], y);
  y = subHeading('Key Conduit Properties', y);
  const conduitProps = [
    ['Length (L)', 'Physical pipe length in m or ft'],
    ['Diameter (D)', 'Internal pipe diameter in m or ft'],
    ['Celerity (a)', 'Pressure-wave speed (m/s or ft/s)'],
    ['Friction (f)', "Darcy-Weisbach or Manning's friction coefficient"],
    ['Pipe Material', "Auto-fills Manning's n, E, and computes celerity"],
    ['Has Added Loss', 'Enable a minor-loss coefficient (K)'],
  ];
  for (const [k, v] of conduitProps) {
    if (y > PH - 20) { newPage(); y = 30; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`${k}:`, ML, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 90, 100);
    doc.text(v, ML + doc.getTextWidth(`${k}:`) + 2, y);
    y += 5.5;
  }
  y += 2;
  y = noteBox("When you select a Pipe Material from the dropdown, Manning's n, Young's Modulus (E), and wave speed (Celerity) are calculated automatically.", y);

  // ── SECTION 4: FLEX TABLE ──────────────────────────────────────────────────
  newPage();
  y = sectionHeading('4.  Flex Table', 22);
  y = para('The Flex Table gives you a spreadsheet-like view of every element in the network. Open it from Tools → Flex Table in the ribbon.', y);
  y += 2;
  y = subHeading('Tab Filters', y);
  y = para('Use the filter chips at the top to switch between: All, Conduit, Dummy Pipe, Reservoir, Node, Junction, Surge Tank, Flow BC, Pump, Check Valve, and Turbine.', y);
  y = subHeading('Editing Cells', y);
  y = para('Click any white cell to edit it inline. Grey background cells are read-only for that element type. Press Tab or Enter to commit; Escape cancels.', y);
  y = subHeading('Unit System', y);
  y = para('The SI / FPS toggle controls the global display unit. Individual rows can override this via the Unit column — an amber border indicates a per-element override.', y);
  y = subHeading('T/H and Q Schedule Pairs', y);
  y = para('For reservoirs with H-Schedule mode, or flow boundaries with Q-Schedule mode, click the Edit Pairs button in that row to open the pairs editor. Enter time/value pairs to define the schedule.', y);
  y = subHeading('Pipe Material (Conduit Tab)', y);
  y = para("Selecting a material in the Material column auto-fills Manning's n, Pipe Elastic Modulus (E), and recalculates wave speed for all conduits or just the selected row, depending on the Apply Material to All Conduits checkbox.", y);
  y = noteBox('Clicking a row in the Flex Table selects the corresponding element on the canvas (and vice versa), keeping both views in sync.', y);

  // ── SECTION 5: EXCEL IMPORT/EXPORT ─────────────────────────────────────────
  newPage();
  y = sectionHeading('5.  Excel Import / Export', 22);
  y = para('The Flex Table supports lossless round-trip Excel synchronization. Export a workbook, edit values in Excel, and import back — all element data is preserved.', y);
  y += 2;
  y = subHeading('Exporting a Single Element Type', y);
  y = stepList([
    'Open the Flex Table (Tools → Flex Table).',
    'Select the desired element type tab (e.g. Conduit).',
    'Click the Export Excel button in the top-right of the tab bar.',
    'An .xlsx file named whamo_conduit_YYYY-MM-DD.xlsx is downloaded.',
  ], y);
  y = subHeading('Exporting All Element Types (Multi-Sheet)', y);
  y = stepList([
    'Open the Flex Table and stay on the All tab.',
    'Click Export Excel — a multi-sheet workbook is created.',
    'Each element type with data gets its own clearly labelled sheet.',
    'The workbook is named whamo_all_<ProjectName>_YYYY-MM-DD.xlsx.',
  ], y);
  y = subHeading('Importing from Excel', y);
  y = stepList([
    'Make sure your network already contains the elements you want to update.',
    'Select the matching tab in the Flex Table (or All for a multi-sheet file).',
    'Click Import Excel and select the .xlsx file.',
    'Each row is matched by its Label. Rows whose labels do not match an existing element are skipped.',
    'After a multi-sheet import, a summary dialog shows updated/skipped counts per sheet.',
  ], y);
  y = noteBox('Import only updates existing elements — it does not create new ones. Make sure all elements exist on the canvas before importing.', y, true);
  y = noteBox('The exported workbook includes Excel data-validation dropdowns for Pipe Material, Mode, and boolean toggles. These dropdowns are preserved on re-import.', y);

  // ── SECTION 6: RUNNING SIMULATIONS ─────────────────────────────────────────
  newPage();
  y = sectionHeading('6.  Running Simulations', 22);
  y = para('WHAMO Network Designer can run the WHAMO hydraulic transient engine directly. Configure parameters, specify output requests, then generate your results.', y);
  y += 2;
  y = subHeading('Computational Parameters', y);
  y = para('Click Analysis → Parameters to open the sidebar. Configure Time Stages by setting DTCOMP (computation step), DTOUT (output interval), and TMAX (maximum simulation time) for each stage.', y);
  y = subHeading('Output Requests', y);
  y = stepList([
    'Click Analysis → Configure to open the Output Requests panel.',
    'Select a node or element, or choose a group type (Nodes, Conduits, Elements).',
    'Tick the variables you want: Q, HEAD, ELEV, VEL, PRESS, PIEZHEAD (or Q, HEAD, SPEED, POWER for turbines).',
    'Click Add Request (or Add All for Group). History, Plot, and Spreadsheet request types are added simultaneously.',
    'Review the Current Requests list at the bottom.',
  ], y);
  y = subHeading('Generating the .OUT File', y);
  y = stepList([
    'Click Generate → .OUT in the ribbon.',
    'The network is validated. Fix any errors and try again.',
    'After validation, the WHAMO engine runs on the server and the .OUT file is generated.',
    'The result is displayed in the file preview panel — you can also send it to Visualization.',
  ], y);
  y = noteBox('The WHAMO engine requires Wine on Linux. It runs in an isolated temporary directory and cleans up after each run.', y);

  // ── SECTION 7: INP & OUT FILES ─────────────────────────────────────────────
  newPage();
  y = sectionHeading('7.  INP & OUT Files', 22);
  y = para('WHAMO uses two text-based file formats: the .INP input file and the .OUT output file. Both can be previewed, downloaded, and analysed within the Designer.', y);
  y += 2;
  y = subHeading('.INP File', y);
  y = para('The .INP file is the WHAMO input definition. It describes the network topology, element properties, computational parameters, and output requests in WHAMO\'s native format.', y);
  y = stepList([
    'Click Generate → .INP in the ribbon.',
    'The network is validated first. Resolve any errors shown.',
    'After validation, confirm the output requests in the Configure panel, then click Generate .INP.',
    'The file is downloaded to your computer.',
  ], y);
  y = subHeading('.OUT File', y);
  y = para('The .OUT file is produced by the WHAMO engine after a simulation run. It contains time-series results for all requested output variables.', y);
  y = subHeading('Viewing Results in Visualization', y);
  y = stepList([
    'Click Tools → Visualization in the ribbon.',
    'Load a .OUT file using the file picker inside the Visualization view.',
    'Switch between Profile Graph (animated HGL) and History Graph (time-series plots).',
  ], y);
  y = noteBox('The .OUT file parser runs entirely client-side — no server upload is needed to view results.', y);

  // ── SECTION 8: KEYBOARD SHORTCUTS ──────────────────────────────────────────
  newPage();
  y = sectionHeading('8.  Keyboard Shortcuts', 22);
  y = para('Use these shortcuts to speed up common actions while working in the canvas or Flex Table.', y);
  y += 2;
  y = subHeading('Canvas Shortcuts', y);
  y = kbTable([
    [['Ctrl', 'Z'], 'Undo last change'],
    [['Ctrl', 'Y'], 'Redo'],
    [['Ctrl', 'S'], 'Save project'],
    [['Delete'], 'Delete selected element(s)'],
    [['Escape'], 'Deselect / cancel link-drawing mode'],
    [['Ctrl', 'A'], 'Select all elements on canvas'],
    [['Ctrl', '+'], 'Zoom in'],
    [['Ctrl', '-'], 'Zoom out'],
    [['Ctrl', 'Shift', 'F'], 'Fit view to network'],
    [['Space'], 'Pan canvas (hold while dragging)'],
  ], y);
  y = subHeading('Flex Table Shortcuts', y);
  y = kbTable([
    [['Tab'], 'Move to next editable cell'],
    [['Shift', 'Tab'], 'Move to previous editable cell'],
    [['Enter'], 'Commit edit and move to next row'],
    [['Escape'], 'Cancel edit without saving'],
  ], y);
  y = subHeading('Canvas Controls (Mouse)', y);
  y = kbTable([
    [['Scroll Wheel'], 'Zoom in / out on canvas'],
    [['Click + Drag (background)'], 'Pan canvas'],
    [['Click + Drag (node)'], 'Move element'],
    [['Click (node)'], 'Select element, show Properties Panel'],
  ], y);

  // ── SECTION 9: TROUBLESHOOTING ─────────────────────────────────────────────
  newPage();
  y = sectionHeading('9.  Troubleshooting', 22);
  y = para('Common issues and how to resolve them.', y);
  y += 2;
  const issues: Array<[string, string]> = [
    [
      'Validation fails with "No path from Reservoir to Node"',
      'Every node must be reachable from at least one Reservoir via conduits. Check the canvas for disconnected elements or broken conduit connections.',
    ],
    [
      'WHAMO engine returns an error or empty .OUT file',
      'Ensure all conduit lengths, diameters, and celerities are non-zero. Check that DTCOMP × celerity / length ≤ 1 (Courant condition). Review the error message in the preview panel for WHAMO-specific diagnostics.',
    ],
    [
      'Import Excel: all rows skipped',
      'The import matches rows by Label. Ensure the Label column in your Excel file matches exactly the element labels on the canvas (case-sensitive). Use Export Excel first to get the correct format.',
    ],
    [
      'Multi-sheet export shows empty workbook',
      'The All tab export only includes element types that have at least one element. Make sure your network has elements before exporting.',
    ],
    [
      'Canvas elements overlap after Auto-Arrange',
      'Auto-Arrange uses a tree layout and works best on networks with a clear flow direction. For complex looped networks, manually position elements after arranging.',
    ],
    [
      'Surge Tank celerity is very high or infinite',
      'Surge tanks are modelled as infinite-celerity elements in WHAMO. This is expected — do not adjust the celerity for surge tank connections.',
    ],
    [
      'Undo/Redo is not available',
      'Undo/Redo is only available when a project is open. Make sure you have opened or saved a project first.',
    ],
  ];
  for (const [q, a] of issues) {
    if (y > PH - 40) { newPage(); y = 30; }
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(210, 220, 230);
    const qLines = doc.splitTextToSize(q, TW - 8);
    const aLines = doc.splitTextToSize(a, TW - 8);
    const boxH = qLines.length * 5 + aLines.length * 4.5 + 10;
    doc.roundedRect(ML, y, TW, boxH, 2, 2, 'FD');
    doc.setFillColor(26, 115, 232);
    doc.roundedRect(ML, y, TW, qLines.length * 5 + 4, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    let qy = y + 5;
    for (const l of qLines) { doc.text(l, ML + 3, qy); qy += 5; }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(50, 70, 90);
    let ay = y + qLines.length * 5 + 7;
    for (const l of aLines) { doc.text(l, ML + 3, ay); ay += 4.5; }
    y += boxH + 3;
  }

  // ── Add page numbers to all pages after TOC ────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 3; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(160, 170, 185);
    doc.text(`${p - 2}`, PW / 2, PH - 10, { align: 'center' });
    doc.text('WHAMO Network Designer — User Manual', ML, PH - 10);
    doc.text(`v1.0`, PW - MR, PH - 10, { align: 'right' });
    // top rule
    doc.setDrawColor(220, 230, 240);
    doc.setLineWidth(0.3);
    doc.line(ML, PH - 13, PW - MR, PH - 13);
  }

  doc.save('WHAMO_Network_Designer_User_Manual.pdf');
}

// ─── UI helper components ─────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-bold text-slate-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </h2>
  );
}

function SectionLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] text-slate-500 mb-5 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </p>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-bold text-slate-800 mt-5 mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] text-slate-600 leading-relaxed mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
      <span className="text-blue-500 flex-shrink-0 mt-0.5">ℹ</span>
      <p className="text-[12px] text-blue-800 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </p>
    </div>
  );
}

function Warn({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
      <span className="text-amber-500 flex-shrink-0 mt-0.5">⚠</span>
      <p className="text-[12px] text-amber-900 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {children}
      </p>
    </div>
  );
}

function ElementCard({ name, badge, desc, fields }: { name: string; badge: string; desc: string; fields?: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white mb-3 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', badge)}>{name}</span>
        <p className="text-[12px] text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{desc}</p>
      </div>
      {fields && fields.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5">
          {fields.map(f => (
            <span key={f} className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">{f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function KbRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 pr-4">
        <div className="flex items-center gap-1">
          {keys.map((k, i) => (
            <span key={i}>
              <kbd className="inline-block px-1.5 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-300 rounded shadow-sm">{k}</kbd>
              {i < keys.length - 1 && <span className="text-slate-400 text-[11px] mx-0.5">+</span>}
            </span>
          ))}
        </div>
      </td>
      <td className="py-2 text-[12px] text-slate-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{action}</td>
    </tr>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="list-none space-y-1.5 mb-3">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1a73e8] text-white text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
          <p className="text-[13px] text-slate-600 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{s}</p>
        </li>
      ))}
    </ol>
  );
}

// ─── Section content ──────────────────────────────────────────────────────────

function GettingStarted() {
  return (
    <>
      <SectionTitle>Getting Started</SectionTitle>
      <SectionLead>WHAMO Network Designer lets you visually build water distribution networks and export them for hydraulic simulation using the WHAMO engine.</SectionLead>

      <SubHeading>Creating a New Project</SubHeading>
      <StepList steps={[
        'Click New in the title bar to create a blank project.',
        'Enter a project name in the centre field of the title bar.',
        'Add elements using the INSERT ribbon (Reservoir, Node, Junction, etc.).',
        'Connect elements by hovering a node until the green handle appears, then dragging to another node.',
        'Click Save As to persist the project to the server.',
      ]} />

      <SubHeading>Opening an Existing Project</SubHeading>
      <StepList steps={[
        'Click Open in the title bar.',
        'Select a project from the Projects list panel.',
        'The canvas, properties, and all settings are restored automatically.',
      ]} />

      <SubHeading>Saving</SubHeading>
      <Para>Use <strong>Save</strong> to overwrite the current project, or <strong>Save As</strong> to create a new revision. Projects are stored on the server and remain available after logging out.</Para>

      <Note>All element property changes are tracked with Undo/Redo (up to 50 steps). Use <strong>Ctrl+Z</strong> and <strong>Ctrl+Y</strong> to navigate the history.</Note>
    </>
  );
}

function NetworkElements() {
  return (
    <>
      <SectionTitle>Network Elements</SectionTitle>
      <SectionLead>Each element in WHAMO represents a physical hydraulic component. Click any INSERT ribbon button to add an element to the canvas.</SectionLead>

      <ElementCard name="Reservoir" badge="bg-blue-600 text-white" desc="Fixed or schedule-driven hydraulic boundary. Provides a constant or time-varying head." fields={['Label', 'Elevation (m/ft)', 'Mode (Fixed/Schedule)', 'H-Schedule #', 'Loss coefficient']} />
      <ElementCard name="Node" badge="bg-slate-600 text-white" desc="Basic junction point in the network. Used wherever pipes meet without special behaviour." fields={['Label', 'Elevation (m/ft)', 'Node number']} />
      <ElementCard name="Junction" badge="bg-emerald-600 text-white" desc="Demand or tee junction with optional demand flow. Use for lateral off-takes." fields={['Label', 'Elevation', 'Demand (m³/s or ft³/s)']} />
      <ElementCard name="Surge Tank" badge="bg-purple-600 text-white" desc="Open or closed surge vessel. Models water-hammer suppression chambers." fields={['Label', 'Tank Top / Bottom', 'Initial Water Level', 'Riser Diameter', 'Area, Shape (E/A pairs)']} />
      <ElementCard name="Flow BC" badge="bg-orange-600 text-white" desc="Flow boundary condition. Injects or extracts a prescribed flow rate, optionally time-varying." fields={['Label', 'Flow rate (Q)', 'Mode', 'Q-Schedule #']} />
      <ElementCard name="Pump" badge="bg-pink-600 text-white" desc="Link element placed on a conduit to represent a pump. Requires a pump characteristic curve (P-Char)." fields={['Label', 'Speed ratio', 'Status (ON/OFF)', 'P-Char data']} />
      <ElementCard name="Check Valve" badge="bg-red-700 text-white" desc="Link element that only allows forward flow. Closes instantly when flow reverses." fields={['Label', 'Loss coefficient']} />
      <ElementCard name="Turbine" badge="bg-cyan-700 text-white" desc="Link element representing a hydraulic turbine. Supports TURBGOV and EMERGENCY closure modes." fields={['Label', 'Mode', 'Gate schedule (V-Schedule)', 'Speed, Inertia']} />

      <SubHeading>Conduits (Pipes)</SubHeading>
      <Para>Conduits are drawn automatically when you connect two elements. They carry flow between nodes. Key properties include length, diameter, celerity (wave speed), and friction factor.</Para>
      <Para><strong>Dummy pipes</strong> are zero-resistance conduits used to represent very short physical connections or to split long pipes.</Para>
    </>
  );
}

function Connections() {
  return (
    <>
      <SectionTitle>Connections (Conduits)</SectionTitle>
      <SectionLead>Every pair of connected elements is linked by a conduit. Drawing and editing conduits is the primary way to build your network topology.</SectionLead>

      <SubHeading>Drawing a Conduit</SubHeading>
      <StepList steps={[
        'Hover over any element node until a green connection handle appears on its edge.',
        'Click and drag from the handle to the target element.',
        'Release the mouse over the target — a conduit (pipe) is created automatically.',
        'The conduit appears in the Flex Table under the Conduit tab where you can set its properties.',
      ]} />

      <SubHeading>Pump / Check Valve / Turbine Links</SubHeading>
      <Para>To add a Pump, Check Valve, or Turbine between two nodes:</Para>
      <StepList steps={[
        'Click the Pump / Check Valve / Turbine button in the INSERT ribbon. The button turns blue to activate link-drawing mode.',
        'Hover over a source element and drag to a target element.',
        'The selected link type is created as a conduit with the special element type set.',
        'Click the active button again to cancel link-drawing mode.',
      ]} />

      <SubHeading>Key Conduit Properties</SubHeading>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          ['Length (L)', 'Physical pipe length in m or ft'],
          ['Diameter (D)', 'Internal pipe diameter in m or ft'],
          ['Celerity (a)', 'Pressure-wave speed (m/s or ft/s)'],
          ['Friction (f)', "Darcy-Weisbach or Manning's friction"],
          ['Pipe Material', 'Auto-fills Manning\'s n, E, and computes celerity'],
          ['Has Added Loss', 'Enable a minor-loss coefficient'],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-50 rounded border border-slate-200 px-2 py-1.5">
            <p className="text-[11px] font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{k}</p>
            <p className="text-[10px] text-slate-500" style={{ fontFamily: 'Poppins, sans-serif' }}>{v}</p>
          </div>
        ))}
      </div>
      <Note>When you select a Pipe Material from the dropdown, Manning's n, Young's Modulus (E), and wave speed (Celerity) are calculated automatically.</Note>
    </>
  );
}

function FlexTableSection() {
  return (
    <>
      <SectionTitle>Flex Table</SectionTitle>
      <SectionLead>The Flex Table gives you a spreadsheet-like view of every element in the network. Open it from Tools → Flex Table in the ribbon.</SectionLead>

      <SubHeading>Tab Filters</SubHeading>
      <Para>Use the filter chips at the top to switch between element types: All, Conduit, Dummy Pipe, Reservoir, Node, Junction, Surge Tank, Flow BC, Pump, Check Valve, and Turbine.</Para>

      <SubHeading>Editing Cells</SubHeading>
      <Para>Click any white cell to edit it inline. Cells with a grey background are read-only for that element type. Press <kbd className="px-1 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-300 rounded shadow-sm">Tab</kbd> or <kbd className="px-1 py-0.5 text-[11px] font-mono bg-slate-100 border border-slate-300 rounded shadow-sm">Enter</kbd> to commit a change.</Para>

      <SubHeading>Unit System</SubHeading>
      <Para>The SI / FPS toggle controls the global display unit. Individual rows can override this via the <strong>Unit</strong> column — an amber border indicates a per-element override.</Para>

      <SubHeading>T/H and Q Schedule Pairs</SubHeading>
      <Para>For reservoirs with H-Schedule mode, or flow boundaries with Q-Schedule mode, click the <strong>Edit Pairs</strong> button in that row to open the pairs editor.</Para>

      <SubHeading>Pipe Material (Conduit Tab)</SubHeading>
      <Para>Selecting a material auto-fills Manning's n, Young's Modulus (E), and recalculates wave speed — for all conduits or just the selected row depending on the <strong>Apply Material to All Conduits</strong> checkbox.</Para>

      <Note>Clicking a row in the Flex Table selects the corresponding element on the canvas (and vice versa), keeping both views in sync.</Note>
    </>
  );
}

function ExcelSection() {
  return (
    <>
      <SectionTitle>Excel Import / Export</SectionTitle>
      <SectionLead>The Flex Table supports lossless round-trip Excel synchronization. Export a workbook, edit values in Excel, and import back — all element data is preserved.</SectionLead>

      <SubHeading>Exporting a Single Element Type</SubHeading>
      <StepList steps={[
        'Open the Flex Table (Tools → Flex Table).',
        'Select the desired element type tab (e.g. Conduit).',
        'Click the Export Excel button in the top-right of the tab bar.',
        'An .xlsx file named whamo_conduit_YYYY-MM-DD.xlsx is downloaded.',
      ]} />

      <SubHeading>Exporting All Element Types (Multi-Sheet)</SubHeading>
      <StepList steps={[
        'Open the Flex Table and stay on the All tab.',
        'Click Export Excel — a multi-sheet workbook is created.',
        'Each element type with data gets its own clearly labelled sheet.',
        'The workbook is named whamo_all_<ProjectName>_YYYY-MM-DD.xlsx.',
      ]} />

      <SubHeading>Importing from Excel</SubHeading>
      <StepList steps={[
        'Make sure your network already contains the elements you want to update.',
        'Select the matching tab in the Flex Table (or All for a multi-sheet file).',
        'Click Import Excel and select the .xlsx file.',
        'Each row is matched by its Label. Rows whose labels do not match an existing element are skipped.',
        'After a multi-sheet import, a summary dialog shows updated/skipped counts per sheet.',
      ]} />

      <Warn>Import only updates existing elements — it does not create new ones. Make sure all elements exist on the canvas before importing.</Warn>
      <Note>The exported workbook includes Excel data-validation dropdowns for fields like Pipe Material, Mode, and boolean toggles. These dropdowns are preserved on re-import.</Note>
    </>
  );
}

function SimulationSection() {
  return (
    <>
      <SectionTitle>Running Simulations</SectionTitle>
      <SectionLead>WHAMO Network Designer can run the WHAMO hydraulic transient engine directly. Configure parameters, specify output requests, then generate your results.</SectionLead>

      <SubHeading>Computational Parameters</SubHeading>
      <Para>Click <strong>Analysis → Parameters</strong> in the ribbon to open the Computational Parameters sidebar. Set DTCOMP (computation step), DTOUT (output interval), and TMAX (maximum time) for each simulation stage.</Para>

      <SubHeading>Output Requests</SubHeading>
      <StepList steps={[
        'Click Analysis → Configure to open the Output Requests panel.',
        'Select a node or element, or choose a group type (Nodes, Conduits, Elements).',
        'Tick the variables: Q, HEAD, ELEV, VEL, PRESS, PIEZHEAD (or Q, HEAD, SPEED, POWER for turbines).',
        'Click Add Request (or Add All for Group). History, Plot, and Spreadsheet types are added simultaneously.',
        'Review the Current Requests list at the bottom.',
      ]} />

      <SubHeading>Generating the .OUT File</SubHeading>
      <StepList steps={[
        'Click Generate → .OUT in the ribbon.',
        'The network is validated. Fix any errors and try again.',
        'After validation, the WHAMO engine runs on the server and the .OUT file is generated.',
        'The result is displayed in the file preview panel.',
      ]} />

      <Note>The WHAMO engine requires Wine on Linux. It runs in an isolated temporary directory and cleans up after each run.</Note>
    </>
  );
}

function FilesSection() {
  return (
    <>
      <SectionTitle>INP & OUT Files</SectionTitle>
      <SectionLead>WHAMO uses two text-based file formats: the .INP input file and the .OUT output file. Both can be previewed, downloaded, and analysed within the Designer.</SectionLead>

      <SubHeading>.INP File</SubHeading>
      <Para>The .INP file is the WHAMO input definition. It describes the network topology, element properties, computational parameters, and output requests in WHAMO's native format.</Para>
      <StepList steps={[
        'Click Generate → .INP in the ribbon.',
        'The network is validated first. Resolve any errors shown.',
        'After validation, confirm the output requests, then click Generate .INP.',
        'The file is downloaded to your computer.',
      ]} />

      <SubHeading>.OUT File</SubHeading>
      <Para>The .OUT file is produced by the WHAMO engine after a simulation run. It contains time-series results for all requested output variables.</Para>
      <StepList steps={[
        'Click Tools → Visualization in the ribbon.',
        'Load a .OUT file using the file picker inside the Visualization view.',
        'Switch between Profile Graph (animated HGL) and History Graph (time-series plots).',
      ]} />

      <Note>The .OUT file parser runs entirely client-side — no server upload is needed to view results.</Note>
    </>
  );
}

function ShortcutsSection() {
  return (
    <>
      <SectionTitle>Keyboard Shortcuts</SectionTitle>
      <SectionLead>Use these shortcuts to speed up common actions while working in the canvas or Flex Table.</SectionLead>

      <SubHeading>Canvas</SubHeading>
      <table className="w-full mb-4 text-[12px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide pr-4">Shortcut</th>
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          <KbRow keys={['Ctrl', 'Z']} action="Undo last change" />
          <KbRow keys={['Ctrl', 'Y']} action="Redo" />
          <KbRow keys={['Ctrl', 'S']} action="Save project" />
          <KbRow keys={['Delete']} action="Delete selected element(s)" />
          <KbRow keys={['Escape']} action="Deselect / cancel link-drawing mode" />
          <KbRow keys={['Ctrl', 'A']} action="Select all elements on canvas" />
          <KbRow keys={['Ctrl', '+']} action="Zoom in" />
          <KbRow keys={['Ctrl', '-']} action="Zoom out" />
          <KbRow keys={['Ctrl', 'Shift', 'F']} action="Fit view to network" />
          <KbRow keys={['Space']} action="Pan canvas (hold while dragging)" />
        </tbody>
      </table>

      <SubHeading>Flex Table</SubHeading>
      <table className="w-full mb-4 text-[12px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide pr-4">Shortcut</th>
            <th className="text-left pb-2 pt-1 text-slate-500 font-semibold text-[10px] uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          <KbRow keys={['Tab']} action="Move to next editable cell" />
          <KbRow keys={['Shift', 'Tab']} action="Move to previous editable cell" />
          <KbRow keys={['Enter']} action="Commit edit and move to next row" />
          <KbRow keys={['Escape']} action="Cancel edit without saving" />
        </tbody>
      </table>
    </>
  );
}

function TroubleshootingSection() {
  return (
    <>
      <SectionTitle>Troubleshooting</SectionTitle>
      <SectionLead>Common issues and how to resolve them.</SectionLead>

      {[
        { q: 'Validation fails with "No path from Reservoir to Node"', a: 'Every node must be reachable from at least one Reservoir via conduits. Check the canvas for disconnected elements or broken conduit connections.' },
        { q: 'WHAMO engine returns an error or empty .OUT file', a: 'Ensure all conduit lengths, diameters, and celerities are non-zero. Check that DTCOMP × celerity / length ≤ 1 (Courant condition). Review the error message in the preview panel.' },
        { q: 'Import Excel: all rows skipped', a: 'The import matches rows by Label. Ensure the Label column in your Excel file matches exactly the element labels on the canvas (case-sensitive). Use Export Excel first to get the correct format.' },
        { q: 'Multi-sheet export shows empty workbook', a: 'The All tab export only includes element types that have at least one element. Make sure your network has elements before exporting.' },
        { q: 'Canvas elements overlap after Auto-Arrange', a: 'Auto-Arrange uses a tree layout and works best on networks with a clear flow direction. For complex looped networks, manually position elements after arranging.' },
        { q: 'Surge Tank celerity is very high or infinite', a: 'Surge tanks are modelled as infinite-celerity elements in WHAMO. This is expected — do not adjust the celerity for surge tank connections.' },
        { q: 'Undo/Redo is not available', a: 'Undo/Redo is only available when a project is open. Make sure you have opened or saved a project first.' },
      ].map(({ q, a }) => (
        <div key={q} className="mb-4 rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-200">
            <ChevronRight className="w-3.5 h-3.5 text-[#1a73e8] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>{q}</p>
          </div>
          <p className="text-[12px] text-slate-600 px-3 py-2.5 leading-relaxed" style={{ fontFamily: 'Poppins, sans-serif' }}>{a}</p>
        </div>
      ))}
    </>
  );
}

const SECTION_CONTENT: Record<string, React.ReactNode> = {
  'getting-started':  <GettingStarted />,
  'elements':         <NetworkElements />,
  'connections':      <Connections />,
  'flex-table':       <FlexTableSection />,
  'excel':            <ExcelSection />,
  'simulation':       <SimulationSection />,
  'files':            <FilesSection />,
  'shortcuts':        <ShortcutsSection />,
  'troubleshooting':  <TroubleshootingSection />,
};

// ─── HelpModal ────────────────────────────────────────────────────────────────
export function HelpModal({ open, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!open) return null;

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        downloadPDF();
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 50);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex"
      data-testid="help-modal"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Backdrop — no onClick so it does NOT close on outside click */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Panel */}
      <div className="relative flex w-full h-full bg-white shadow-2xl overflow-hidden">

        {/* ── Left sidebar ── */}
        <aside className="w-[220px] flex-shrink-0 flex flex-col bg-slate-900 text-white">
          <div className="px-4 py-4 border-b border-slate-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-[13px] font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>User Guide</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">WHAMO Network Designer</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                data-testid={`help-nav-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors text-[12px]',
                  activeSection === sec.id
                    ? 'bg-[#1a73e8] text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium',
                )}
              >
                <span className="flex-shrink-0 opacity-75">{sec.icon}</span>
                {sec.label}
              </button>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0">
            <p className="text-[10px] text-slate-500">v1.0 — WHAMO ND</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{SECTIONS.find(s => s.id === activeSection)?.icon}</span>
              <span className="text-[13px] font-semibold text-slate-700">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Download PDF button */}
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                data-testid="help-download-pdf"
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors',
                  isGeneratingPdf
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#1a73e8] text-white hover:bg-[#1557b0] active:bg-[#0f3f8c]',
                )}
                title="Download User Manual PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                {isGeneratingPdf ? 'Generating…' : 'Download PDF'}
              </button>
              {/* Close button — only way to dismiss */}
              <button
                onClick={onClose}
                data-testid="help-modal-close"
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#fafbfc]">
            <div className="max-w-3xl">
              {SECTION_CONTENT[activeSection]}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
