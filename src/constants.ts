import { Subject, PYQ, FormulaCategory, QuizQuestion } from './types';

export const JEE_SYLLABUS: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Zap',
    color: 'text-blue-600',
    topics: [
      { id: 'p1', title: 'Physics and Measurement', completed: false, videoUrl: 'https://www.youtube.com/embed/YmP6Z-76N_E' },
      { id: 'p2', title: 'Kinematics', completed: false, videoUrl: 'https://www.youtube.com/embed/S26vG6B6Z-E' },
      { id: 'p3', title: 'Laws of Motion', completed: false, videoUrl: 'https://www.youtube.com/embed/v9S_6u_8Z0s' },
      { id: 'p4', title: 'Work, Energy and Power', completed: false, videoUrl: 'https://www.youtube.com/embed/wW_XQ_6Z-E' },
      { id: 'p5', title: 'Rotational Motion', completed: false, videoUrl: 'https://www.youtube.com/embed/6Z-E_XQ_6Z-E' },
      { id: 'p6', title: 'Gravitation', completed: false, videoUrl: 'https://www.youtube.com/embed/7Z-E_XQ_6Z-E' },
      { id: 'p7', title: 'Properties of Solids and Liquids', completed: false },
      { id: 'p8', title: 'Thermodynamics', completed: false },
      { id: 'p9', title: 'Kinetic Theory of Gases', completed: false },
      { id: 'p10', title: 'Oscillations and Waves', completed: false },
      { id: 'p11', title: 'Electrostatics', completed: false },
      { id: 'p12', title: 'Current Electricity', completed: false },
      { id: 'p13', title: 'Magnetic Effects of Current and Magnetism', completed: false },
      { id: 'p14', title: 'Electromagnetic Induction and AC', completed: false },
      { id: 'p15', title: 'Electromagnetic Waves', completed: false },
      { id: 'p16', title: 'Optics', completed: false },
      { id: 'p17', title: 'Dual Nature of Matter and Radiation', completed: false },
      { id: 'p18', title: 'Atoms and Nuclei', completed: false },
      { id: 'p19', title: 'Electronic Devices', completed: false },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'Beaker',
    color: 'text-emerald-600',
    topics: [
      { id: 'c1', title: 'Some Basic Concepts in Chemistry', completed: false },
      { id: 'c2', title: 'States of Matter', completed: false },
      { id: 'c3', title: 'Atomic Structure', completed: false },
      { id: 'c4', title: 'Chemical Bonding and Molecular Structure', completed: false },
      { id: 'c5', title: 'Chemical Thermodynamics', completed: false },
      { id: 'c6', title: 'Solutions', completed: false },
      { id: 'c7', title: 'Equilibrium', completed: false },
      { id: 'c8', title: 'Redox Reactions and Electrochemistry', completed: false },
      { id: 'c9', title: 'Chemical Kinetics', completed: false },
      { id: 'c10', title: 'Surface Chemistry', completed: false },
      { id: 'c11', title: 'Classification of Elements and Periodicity', completed: false },
      { id: 'c12', title: 'General Principles and Processes of Isolation of Metals', completed: false },
      { id: 'c13', title: 'Hydrogen', completed: false },
      { id: 'c14', title: 'S-Block Elements', completed: false },
      { id: 'c15', title: 'P-Block Elements', completed: false },
      { id: 'c16', title: 'D and F Block Elements', completed: false },
      { id: 'c17', title: 'Coordination Compounds', completed: false },
      { id: 'c18', title: 'Environmental Chemistry', completed: false },
      { id: 'c19', title: 'Purification and Characterisation of Organic Compounds', completed: false },
      { id: 'c20', title: 'Some Basic Principles of Organic Chemistry', completed: false },
      { id: 'c21', title: 'Hydrocarbons', completed: false },
      { id: 'c22', title: 'Organic Compounds Containing Halogens', completed: false },
      { id: 'c23', title: 'Organic Compounds Containing Oxygen', completed: false },
      { id: 'c24', title: 'Organic Compounds Containing Nitrogen', completed: false },
      { id: 'c25', title: 'Polymers', completed: false },
      { id: 'c26', title: 'Biomolecules', completed: false },
      { id: 'c27', title: 'Chemistry in Everyday Life', completed: false },
      { id: 'c28', title: 'Principles Related to Practical Chemistry', completed: false },
    ],
  },
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    color: 'text-orange-600',
    topics: [
      { id: 'm1', title: 'Sets, Relations and Functions', completed: false },
      { id: 'm2', title: 'Complex Numbers and Quadratic Equations', completed: false },
      { id: 'm3', title: 'Matrices and Determinants', completed: false },
      { id: 'm4', title: 'Permutations and Combinations', completed: false },
      { id: 'm5', title: 'Mathematical Induction', completed: false },
      { id: 'm6', title: 'Binomial Theorem and its Simple Applications', completed: false },
      { id: 'm7', title: 'Sequences and Series', completed: false },
      { id: 'm8', title: 'Limit, Continuity and Differentiability', completed: false },
      { id: 'm9', title: 'Integral Calculus', completed: false },
      { id: 'm10', title: 'Differential Equations', completed: false },
      { id: 'm11', title: 'Coordinate Geometry', completed: false },
      { id: 'm12', title: 'Three Dimensional Geometry', completed: false },
      { id: 'm13', title: 'Vector Algebra', completed: false },
      { id: 'm14', title: 'Statistics and Probability', completed: false },
      { id: 'm15', title: 'Trigonometry', completed: false },
      { id: 'm16', title: 'Mathematical Reasoning', completed: false },
    ],
  },
];

export const PYQS: PYQ[] = [
  {
    id: 'pyq1',
    subject: 'Physics',
    year: 2024,
    question: 'A particle moves along a straight line such that its displacement x at any time t is given by x = 3t^2 + 4t + 5. The velocity of the particle at t = 2s is:',
    options: ['12 m/s', '16 m/s', '20 m/s', '10 m/s'],
    correctAnswer: 1,
    explanation: 'Velocity v = dx/dt = 6t + 4. At t = 2s, v = 6(2) + 4 = 16 m/s.'
  },
  {
    id: 'pyq2',
    subject: 'Mathematics',
    year: 2023,
    question: 'If the roots of the equation x^2 - 5x + 6 = 0 are α and β, then the value of α^2 + β^2 is:',
    options: ['13', '25', '12', '10'],
    correctAnswer: 0,
    explanation: 'α + β = 5, αβ = 6. α^2 + β^2 = (α + β)^2 - 2αβ = 5^2 - 2(6) = 25 - 12 = 13.'
  },
  {
    id: 'pyq3',
    subject: 'Chemistry',
    year: 2024,
    question: 'The oxidation state of Chromium in K2Cr2O7 is:',
    options: ['+3', '+4', '+5', '+6'],
    correctAnswer: 3,
    explanation: '2(+1) + 2x + 7(-2) = 0 => 2 + 2x - 14 = 0 => 2x = 12 => x = +6.'
  },
  {
    id: 'pyq4',
    subject: 'Physics',
    year: 2023,
    question: 'The dimension of Planck\'s constant (h) is equivalent to that of:',
    options: ['Linear momentum', 'Angular momentum', 'Energy', 'Power'],
    correctAnswer: 1,
    explanation: 'h = E/ν = [ML^2T^-2]/[T^-1] = [ML^2T^-1]. Angular momentum L = mvr = [M][LT^-1][L] = [ML^2T^-1].'
  },
  {
    id: 'pyq5',
    subject: 'Mathematics',
    year: 2024,
    question: 'The value of the integral ∫(0 to π/2) sin^4x / (sin^4x + cos^4x) dx is:',
    options: ['π/2', 'π/4', 'π/8', 'π'],
    correctAnswer: 1,
    explanation: 'Using property ∫(0 to a) f(x) dx = ∫(0 to a) f(a-x) dx, let I be the integral. I = ∫ sin^4x / (sin^4x + cos^4x) dx. Also I = ∫ cos^4x / (cos^4x + sin^4x) dx. 2I = ∫ 1 dx = [x](0 to π/2) = π/2. So I = π/4.'
  }
];

export const FORMULAS: FormulaCategory[] = [
  {
    id: 'f-phy-1',
    subject: 'Physics',
    category: 'Mechanics',
    formulas: [
      { id: 'p-f-1', title: 'Equations of Motion', latex: 'v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as', description: 'Constant acceleration equations.' },
      { id: 'p-f-2', title: 'Work-Energy Theorem', latex: 'W = \\Delta K = K_f - K_i', description: 'Work done equals change in kinetic energy.' },
      { id: 'p-f-3', title: 'Gravitational Potential Energy', latex: 'U = -\\frac{GMm}{r}', description: 'Potential energy in a gravitational field.' }
    ]
  },
  {
    id: 'f-phy-2',
    subject: 'Physics',
    category: 'Electrodynamics',
    formulas: [
      { id: 'p-f-4', title: 'Coulomb\'s Law', latex: 'F = k\\frac{q_1q_2}{r^2}', description: 'Electrostatic force between two charges.' },
      { id: 'p-f-5', title: 'Ohm\'s Law', latex: 'V = IR', description: 'Relationship between voltage, current, and resistance.' }
    ]
  },
  {
    id: 'f-chem-1',
    subject: 'Chemistry',
    category: 'Physical Chemistry',
    formulas: [
      { id: 'c-f-1', title: 'Ideal Gas Equation', latex: 'PV = nRT', description: 'Relationship for an ideal gas.' },
      { id: 'c-f-2', title: 'Gibbs Free Energy', latex: '\\Delta G = \\Delta H - T\\Delta S', description: 'Spontaneity of a reaction.' },
      { id: 'c-f-3', title: 'Nernst Equation', latex: 'E = E^0 - \\frac{RT}{nF}\\ln Q', description: 'Cell potential at non-standard conditions.' }
    ]
  },
  {
    id: 'f-math-1',
    subject: 'Mathematics',
    category: 'Calculus',
    formulas: [
      { id: 'm-f-1', title: 'Differentiation', latex: '\\frac{d}{dx}(x^n) = nx^{n-1}, \\quad \\frac{d}{dx}(\\sin x) = \\cos x', description: 'Basic derivatives.' },
      { id: 'm-f-2', title: 'Integration', latex: '\\int x^n dx = \\frac{x^{n+1}}{n+1} + C, \\quad \\int \\frac{1}{x} dx = \\ln|x| + C', description: 'Basic integrals.' }
    ]
  },
  {
    id: 'f-math-2',
    subject: 'Mathematics',
    category: 'Trigonometry',
    formulas: [
      { id: 'm-f-3', title: 'Pythagorean Identity', latex: '\\sin^2 \\theta + \\cos^2 \\theta = 1', description: 'Fundamental trig identity.' },
      { id: 'm-f-4', title: 'Double Angle Formulas', latex: '\\sin 2\\theta = 2\\sin\\theta\\cos\\theta, \\quad \\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta', description: 'Double angle relationships.' }
    ]
  }
];

export const QUIZZES: QuizQuestion[] = [
  {
    id: 'q1',
    subject: 'Physics',
    topic: 'Kinematics',
    question: 'A car accelerates from rest at a constant rate of 2 m/s^2. How far will it travel in 10 seconds?',
    options: ['50 m', '100 m', '150 m', '200 m'],
    correctAnswer: 1,
    explanation: 'Using s = ut + 1/2 at^2: s = 0(10) + 1/2 (2)(10^2) = 100 m.'
  },
  {
    id: 'q2',
    subject: 'Mathematics',
    topic: 'Complex Numbers and Quadratic Equations',
    question: 'The value of i^49 is:',
    options: ['i', '-i', '1', '-1'],
    correctAnswer: 0,
    explanation: 'i^49 = i^(48+1) = (i^4)^12 * i = 1^12 * i = i.'
  },
  {
    id: 'q3',
    subject: 'Chemistry',
    topic: 'Atomic Structure',
    question: 'The maximum number of electrons in a subshell with l = 2 is:',
    options: ['2', '6', '10', '14'],
    correctAnswer: 2,
    explanation: 'Number of electrons = 2(2l + 1). For l = 2, 2(2*2 + 1) = 2(5) = 10.'
  },
  {
    id: 'q4',
    subject: 'Physics',
    topic: 'Electrostatics',
    question: 'Two charges +q and -q are separated by a distance d. The electric potential at the midpoint between them is:',
    options: ['kq/d', '2kq/d', '0', 'kq/2d'],
    correctAnswer: 2,
    explanation: 'Potential V = V1 + V2 = kq/(d/2) + k(-q)/(d/2) = 0.'
  },
  {
    id: 'q5',
    subject: 'Mathematics',
    topic: 'Matrices and Determinants',
    question: 'If A is a square matrix of order 3 and |A| = 5, then |adj A| is:',
    options: ['5', '25', '125', '15'],
    correctAnswer: 1,
    explanation: '|adj A| = |A|^(n-1). For n=3, |adj A| = 5^(3-1) = 5^2 = 25.'
  },
  {
    id: 'q6',
    subject: 'Chemistry',
    topic: 'Chemical Bonding and Molecular Structure',
    question: 'The shape of XeF4 molecule is:',
    options: ['Tetrahedral', 'Square Planar', 'Octahedral', 'Pyramidal'],
    correctAnswer: 1,
    explanation: 'XeF4 has 4 bond pairs and 2 lone pairs. According to VSEPR theory, it is square planar.'
  }
];
