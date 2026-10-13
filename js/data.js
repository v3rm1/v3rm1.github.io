// Single source of truth for the site. After editing, run
//   node scripts/build-static.mjs
// to regenerate the hero, static HTML, German page and skill evidence.
//
// `stack` lists on education, experience, publications and projects must use
// skill names exactly as written in `skills.groups`; the build script maps each
// skill to everything that used it and warns about names it does not know.
const DATA = {
  // Hero shown above the terminal. `availability` is rendered only when set.
  profile: {
    name: "Varun Ravi Varma",
    headline: "AI Research Scientist — Reinforcement Learning & Multi-Agent Systems",
    tagline: "PhD researcher at the University of Agder building interpretable, multi-agent RL agents for long-horizon decision-making, with industry experience shipping ML and data pipelines.",
    availability: "Open to research programmer and applied scientist roles in Germany, Austria or Switzerland (DACH) from early 2028.",
    topSkills: ["Multi-agent RL", "JAX", "Simulation & agent-based modelling", "GPU experiment sweeps", "Interpretable & explainable ML", "Data pipelines", "Python"],
    location: "Grimstad, Norway",
    url: "https://v3rm1.github.io/",
    // Industry CV is the default download; source in cv-src/industry-cv.tex.
    cv: "files/cv/VarunRaviVarma_Industry_CV.pdf",
    academicCv: "files/cv/VRVarma_Academic_CV.pdf",
    ogImage: "images/og-card.png"
  },

  // German landing page (de/index.html). Technical terms stay in English.
  de: {
    headline: "KI-Forscher — Reinforcement Learning & Multi-Agenten-Systeme",
    tagline: "Doktorand an der Universität Agder (Norwegen). Ich entwickle interpretierbare Multi-Agenten-RL-Systeme für langfristige Entscheidungsprobleme und bringe Industrieerfahrung mit ML- und Datenpipelines mit.",
    availability: "Offen für Stellen als Research Programmer oder Applied Scientist in Deutschland, Österreich oder der Schweiz ab Anfang 2028.",
    about: `Mein Weg führt vom Maschinenbau über Datenanalyse-Beratung und
Gesundheitsdatenwissenschaft zur KI-Promotion. Heute arbeite ich an
Multi-Agenten-Reinforcement-Learning: hierarchische Koordination,
GPU-beschleunigte Simulation in JAX und reproduzierbare Experimente im großen
Maßstab. Aus der Industrie bringe ich Erfahrung mit Datenpipelines,
Kundenprojekten und Teamschulungen mit.

Sprachen: Englisch (fließend), Deutsch (A2–B1, aktuell in Kursen der
Universität Heidelberg).`,
    groups: {
      "Research & methods": "Forschung & Methoden",
      "Machine learning": "Maschinelles Lernen",
      "ML engineering & infrastructure": "ML-Engineering & Infrastruktur",
      "Data": "Daten",
      "Programming languages": "Programmiersprachen",
      "Communication": "Kommunikation",
      "Engineering background": "Ingenieurwissenschaftlicher Hintergrund"
    }
  },

  about: `AI Research Scientist specialising in Reinforcement Learning, Agentic AI
and Sequential Decision-Making. PhD candidate with a strong background in
Multi-Agent Systems (MAS) and interpretable decision-making.

My path runs from mechanical engineering through data and analytics
consulting and health data science to an AI PhD, so I am as comfortable
building data pipelines and research infrastructure as designing learning
algorithms.

Expertise in designing intelligent agents that interact with complex
environments, reasoning over long-horizon objectives, and optimising behaviour
through simulation and feedback.

Passionate about applying adaptive AI to systems engineering, architecture
exploration, and engineering workflow automation. Proven track record in
bridging theoretical research with industrial innovation, with extensive
experience in Python, JAX and scalable AI infrastructure.`,

  education: [
    {
      institution: "University of Agder",
      degree: "PhD, Artificial Intelligence",
      period: "2023 - 2027 (expected)",
      start: "2023",
      location: "Grimstad, Norway",
      details: [
        "Doctoral Researcher specialising in Multi-Agent Reinforcement Learning (MARL), Sequential Decision-Making, and Model Interpretability.",
        "Developing algorithms for hierarchical planning, resource allocation, and trajectory analysis with a focus on emergent dynamics and long-horizon objectives in complex systems."
      ],
      stack: ["Reinforcement learning", "Multi-agent RL", "Sequential decision-making", "Hierarchical planning", "Simulation & agent-based modelling", "Graph neural networks", "LLMs & agentic workflows", "JAX", "CUDA", "Python", "Rust", "Academic writing", "LaTeX & TikZ"]
    },
    {
      institution: "University of Groningen",
      degree: "M.Sc. Artificial Intelligence",
      period: "2019 - 2021",
      start: "2019",
      location: "Groningen, Netherlands",
      details: [
        "Specialised in Deep Learning, Automaton Theory, and Reinforcement Learning.",
        "Thesis: Developed an interpretable RL agent using the Regression Tsetlin Machine to provide transparent, logic-based decision-making."
      ],
      stack: ["Reinforcement learning", "Deep learning", "Tsetlin machines", "Multi-agent systems", "Cognitive modelling", "Slurm & HPC clusters"]
    },
    {
      institution: "Visveswaraya Technological University",
      degree: "B.Tech. Mechanical Engineering",
      period: "2012 - 2016",
      start: "2012",
      location: "Karnataka, India",
      details: [
        "Focused on Thermodynamics, Computer-Aided Design (CAD), and mechanical component analysis.",
        "Developed a Peltier-effect solar cell for the final year engineering project."
      ],
      stack: ["Mechanical engineering", "CAD", "Thermodynamics"]
    }
  ],

  // Newest first. `teaching: true` entries also appear under `teaching`.
  experience: [
    {
      company: "University of Agder",
      role: "Teaching Assistant",
      period: "August 2025 - January 2026",
      start: "2025-08",
      location: "Grimstad, Norway",
      teaching: true,
      details: [
        "Research Methods for AI and IoT: Assisted with lectures, tutorials and exam evaluations.",
        "Computer Vision: Assisted with lectures and labs, mentored student projects and evaluated technical reports."
      ],
      stack: ["Teaching", "Computer vision", "Experimental design & robust evaluation"]
    },
    {
      company: "Sano Centre for Computational Medicine",
      role: "Scientific Programmer - Personal Health Data Science",
      period: "June 2022 - September 2023",
      start: "2022-06",
      location: "Krakow, Poland",
      details: [
        "Architected analytical pipelines for structured and unstructured medical artefacts, leveraging knowledge graphs and dependency mapping for reasoning and inference.",
        "Developed and deployed research tools using Docker and Git-based CI/CD workflows, ensuring reproducible experimentation and scalable training pipelines."
      ],
      stack: ["Data pipelines", "Knowledge graphs", "Graph neural networks", "Docker", "Git & CI/CD", "CUDA", "Python", "Rust"]
    },
    {
      company: "University of Groningen",
      role: "Graduate Teaching Assistant",
      period: "February 2020 - August 2020",
      start: "2020-02",
      location: "Groningen, Netherlands",
      teaching: true,
      details: [
        "Deep Learning: Assisted with labs, mentored students and evaluated technical practical reports.",
        "Logical Aspects of Multi-Agent Systems: Facilitated tutorials, graded assignments and reviewed course projects."
      ],
      stack: ["Teaching", "Deep learning", "Multi-agent systems"]
    },
    {
      company: "Neudesic Global Services LLC",
      role: "Consultant II - Data Analytics",
      period: "July 2018 - November 2018",
      start: "2018-07",
      location: "Bangalore, India",
      details: [
        "Engineered scalable solutions for large-scale data cleansing and deep learning applications.",
        "Designed Proof-of-Concept (PoC) ML models for global clients in the Energy and Finance sectors.",
        "Managed structured and unstructured data migration and analysis across cloud and on-premise infrastructures.",
        "Founded and led an internal upskilling group, conducting weekly sessions on statistics and machine learning."
      ],
      stack: ["Data pipelines", "Deep learning", "Model serving (REST/gRPC)", "Kubernetes", "Azure", "Databricks", "SQL (SQL Server, MySQL)", "MongoDB", "Workshops & mentoring", "Python"]
    },
    {
      company: "Neudesic Global Services LLC",
      role: "Consultant I - Data Analytics",
      period: "July 2017 - June 2018",
      start: "2017-07",
      location: "Bangalore, India",
      details: [
        "Executed data warehousing and advanced analytics projects for diverse industry clients.",
        "Organised office-wide hackathons and technical workshops to drive the adoption of emerging technologies.",
        "Built and demonstrated various technical hobby projects and internal Proofs-of-Concept."
      ],
      stack: ["Data warehousing", "SQL (SQL Server, MySQL)", "Power BI", "Tableau", "Workshops & mentoring"]
    },
    {
      company: "Neudesic Global Services LLC",
      role: "Associate Consultant",
      period: "June 2016 - June 2017",
      start: "2016-06",
      location: "Bangalore, India",
      details: [
        "Developed PowerShell automation scripts and maintained web application architectures for client projects."
      ],
      stack: ["PowerShell", "C#"]
    }
  ],

  // Capability groups. Skills without any `stack` evidence are still listed.
  skills: {
    groups: {
      "Research & methods": [
        "Reinforcement learning", "Multi-agent RL", "Sequential decision-making",
        "Hierarchical planning", "Simulation & agent-based modelling",
        "Interpretable & explainable ML", "Tsetlin machines",
        "Robustness & data abstraction", "Experimental design & robust evaluation",
        "Multi-agent systems", "Cognitive modelling"
      ],
      "Machine learning": [
        "Deep learning", "Graph neural networks", "LLMs & agentic workflows",
        "Computer vision", "NLP (spaCy, NLTK)", "JAX", "PyTorch",
        "TensorFlow & Keras", "Scikit-learn", "XGBoost"
      ],
      "ML engineering & infrastructure": [
        "GPU experiment sweeps", "CUDA", "Slurm & HPC clusters", "MLflow", "Docker",
        "Kubernetes", "Azure", "Databricks", "Model serving (REST/gRPC)", "Git & CI/CD",
        "Linux", "Library & API design"
      ],
      "Data": [
        "Data pipelines", "Knowledge graphs", "SQL (SQL Server, MySQL)", "MongoDB",
        "Data warehousing", "Power BI", "Tableau"
      ],
      "Programming languages": ["Python", "C++", "Rust", "C#", "Julia", "JavaScript", "PowerShell"],
      "Communication": [
        "Academic writing", "LaTeX & TikZ", "Quarto", "Teaching", "Workshops & mentoring"
      ],
      "Engineering background": ["Mechanical engineering", "CAD", "Thermodynamics"]
    },
    alsoUsed: [
      "NumPy", "Pandas", "SciPy", "Matplotlib & Seaborn", "Jupyter", "pyTsetlinMachine",
      "GloVe", "RAKE", "Microsoft SSRS", "Unix"
    ],
    languages: ["English — fluent", "German — A2–B1, currently taking courses at Heidelberg University"]
  },

  publications: [
    {
      title: "Improving Noise Robustness through Abstractions and its Impact on Machine Learning",
      venue: "arXiv preprint",
      year: 2024,
      status: "Preprint",
      doi: "10.48550/arXiv.2406.08428",
      description: "Systematic analysis of data discretisation techniques to enhance model robustness against noisy datasets, optimising performance for real-world ML applications.",
      stack: ["Robustness & data abstraction", "Python"]
    },
    {
      title: "CACTUS: A Comprehensive Abstraction and Classification Tool for Uncovering Structures",
      venue: "ACM Transactions on Intelligent Systems and Technology",
      year: 2024,
      status: "Published",
      doi: "10.1145/3649459",
      description: "Developed a high-performance analytical pipeline for healthcare data featuring optimised memory management, parallelised computation, and support for high-dimensional categorical attributes.",
      stack: ["Interpretable & explainable ML", "Robustness & data abstraction", "Data pipelines", "Python"]
    },
    {
      title: "SaNDA: A Small and iNcomplete Dataset Analyser",
      venue: "Information Sciences (Elsevier)",
      year: 2023,
      status: "Published",
      doi: "10.1016/j.ins.2023.119078",
      description: "Designed an explainable analytical framework specifically for incomplete medical datasets, improving data utility in data-scarce environments.",
      stack: ["Interpretable & explainable ML", "Robustness & data abstraction", "Python"]
    },
    {
      title: "Adaptive Pandemic Analysis: An Agent-Based Reinforcement Learning Framework",
      venue: "FAIEMA 2024",
      year: 2024,
      status: "Published",
      doi: null,
      description: "Architected a conceptual modelling framework using Agent-Based Modelling (ABM) and RL to simulate and analyse the dynamics of complex biological systems.",
      stack: ["Reinforcement learning", "Simulation & agent-based modelling"]
    }
  ],

  // Categories are listed in this order by the `projects` command.
  projectCategories: ["Current research", "Research", "Personal"],

  projects: {
    marl_coordination: {
      title: "Hierarchical Coordination in Multi-Agent Reinforcement Learning",
      category: "Current research",
      status: "Ongoing — details after publication",
      link: null,
      description: `How should a team of learning agents organise itself when no single agent
sees the whole picture and payoffs arrive only after long delays?

This PhD project designs structured, hierarchical multi-agent RL
architectures in which agents coordinate in sub-teams, and compares them
against established flat MARL baselines. The emphasis is on scaling to larger
teams, robustness to partial observability, and honest evaluation across many
random seeds with statistically sound aggregate metrics.`,
      stack: ["Multi-agent RL", "Reinforcement learning", "Hierarchical planning", "Sequential decision-making", "Experimental design & robust evaluation", "JAX", "Python"]
    },
    gpu_sim: {
      title: "GPU-Accelerated Simulation for Multi-Agent Learning",
      category: "Current research",
      status: "Ongoing — details after publication",
      link: null,
      description: `Learning agents need millions of interactions, so the simulator is often the
bottleneck. This project builds fully vectorised, JIT-compiled simulation
environments in JAX, so that thousands of scenarios step in parallel on a
single GPU, with a validation suite to check the simulated dynamics behave
plausibly.`,
      stack: ["Simulation & agent-based modelling", "JAX", "Multi-agent RL", "Experimental design & robust evaluation", "Python"]
    },
    marl_library: {
      title: "JAX Library of Multi-Agent RL Algorithms",
      category: "Current research",
      status: "Ongoing",
      link: null,
      description: `An environment-agnostic library of cooperative multi-agent RL algorithms
written in JAX, covering trust-region actor-critic, value-decomposition and
hierarchical methods behind a common interface, so new environments and
algorithms can be swapped in without rewriting training code.`,
      stack: ["Library & API design", "JAX", "Multi-agent RL", "Reinforcement learning", "Python"]
    },
    research_infra: {
      title: "Infrastructure for Large-Scale RL Experiments",
      category: "Current research",
      status: "Ongoing",
      link: null,
      description: `Reproducible multi-seed training sweeps on a shared multi-GPU server:
containerised runs, per-GPU job queues with file locking, experiment tracking
in MLflow, and automated collection of results into analysis-ready form for
papers and figures.`,
      stack: ["GPU experiment sweeps", "Docker", "MLflow", "Linux", "Experimental design & robust evaluation", "Python"]
    },
    thesis: {
      title: "Interpretable Reinforcement Learning with Regression Tsetlin Machine",
      category: "Research",
      link: "https://github.com/v3rm1/tsetlin_rl_atari",
      description: `Master's Thesis | University of Groningen
Link: FSE Theses Repository, RUG

Engineered a novel Reinforcement Learning (RL) agent using the Regression
Tsetlin Machine to achieve transparent, logic-based decision-making. Focused
on replacing "black-box" neural networks with propositional logic automata to
reduce computational overhead and increase model interpretability in complex
environments.`,
      stack: ["Reinforcement learning", "Tsetlin machines", "Interpretable & explainable ML", "Python"]
    },
    cogn_mod: {
      title: "Cognitive Modelling: Basic Principles and Methods",
      category: "Research",
      link: "https://github.com/v3rm1/cogn_mod_basic",
      description: `Assignments and Project work for the Cognitive Modelling course offered under
the MSc AI programme at the University of Groningen.

We attempt to model an ACT-R (Adaptive Control of Thought - Rational) agent
to study how the model performs in a timing experiment based on the experiment
carried out by Jazayeri and Shadlen.

Temporal learning is modelled as a Bayesian Process with prior experiences
affecting the perception of future temporal signals. The model is built in
Python using the ACT-R theoretical framework.

The experiment alters previous work by utilising highly skewed base
distributions and removing participant feedback. The model depicted clearly
the expected skew in outputs discussed in the experimentation section.`,
      stack: ["Cognitive modelling", "Python"]
    },
    deep_learning: {
      title: "Deep Learning: Reinforcement Learning with Confidence Estimation",
      category: "Research",
      link: "https://github.com/v3rm1/dl2_rl",
      description: `Project work for the Deep Learning course offered under the MSc AI programme
at the University of Groningen.

Devised an unconventional method of including confidence estimation in a
reinforcement learning system. The system outputs action/confidence pairs,
where the confidence represents the system's best guess as to the probability
of the action resulting in a successful outcome.

The confidence is trained by altering the reward function such that the reward
is a function of both the real value of the action and the confidence given.
Tested using Proximal Policy Optimisation (PPO) on the Atari Pong environment.

Two approaches tested:
  1. Proximal Policy Optimisation (PPO)
  2. PPO with Confidence Estimation

The model achieves accurate confidence estimation when the estimated
confidence equals the probability value returned by the Softmax layer.`,
      stack: ["Reinforcement learning", "Deep learning", "Python"]
    },
    ml_bach: {
      title: "Machine Learning: Completing the Unfinished Bach Fugue",
      category: "Research",
      link: "https://github.com/v3rm1/ml_bach_fugue",
      description: `Project work for the Machine Learning course offered under the MSc AI programme
at the University of Groningen.

This project predicts Bach's last fugue using machine learning. Approaches:

  - Simple Bigram model (baseline)
  - Character-level LSTM trained on MIDI-to-text conversions
  - Preprocessing pipeline for MIDI <-> pitch list conversion

The predicted outputs are available in the Generated Music folder.
You can listen to the generated output by playing bigram_output.mid.`,
      stack: ["Deep learning", "Python"]
    },
    portfolio: {
      title: "This Site: Terminal Portfolio & Quarto Blog",
      category: "Personal",
      link: "https://github.com/v3rm1/v3rm1.github.io",
      description: `The site you are reading: a dependency-free terminal UI in plain JavaScript,
with crawlable static HTML and a German landing page generated from a single
data file by a small Node build script, plus a Quarto blog sharing the same
theme.`,
      stack: ["JavaScript", "Quarto"]
    },
    road_sign: {
      title: "HackerEarth: Road Sign Detection",
      category: "Personal",
      link: null,
      description: `Computer Vision & Classification

Implemented ensemble machine learning models to classify road sign
orientations, utilising Power BI for feature correlation analysis and data
distribution mapping.

Stack: XGBoost, Random Forests, Scikit-Learn, Numpy, Power BI`,
      stack: ["Computer vision", "XGBoost", "Scikit-learn", "Power BI", "Python"]
    },
    ad_click: {
      title: "HackerEarth: Ad Click Prediction",
      category: "Personal",
      link: null,
      description: `Big Data & Predictive Analytics

Developed a predictive model for user ad-engagement based on historical
request data and geospatial parameters.

Stack: XGBoost, Scikit-Learn, Numpy, Jupyter`,
      stack: ["XGBoost", "Scikit-learn", "Python"]
    },
    product_rec: {
      title: "HackerEarth: Product Recognition",
      category: "Personal",
      link: null,
      description: `Deep Learning & CNNs

Leveraged Deep Convolutional Neural Networks (Inception, VGG-19, ResNet) to
automate the classification of retail inventory items.

Stack: Keras, Scikit-Learn, Numpy, Jupyter`,
      stack: ["Computer vision", "Deep learning", "TensorFlow & Keras", "Scikit-learn", "Python"]
    },
    network_attack: {
      title: "HackerEarth: Network Attack Prediction",
      category: "Personal",
      link: null,
      description: `Cybersecurity AI

Built a security-focused ML model to identify server farm vulnerabilities
and predict potential network attacks using anonymised traffic parameters.

Stack: Keras, XGBoost, Scikit-Learn, Numpy`,
      stack: ["Deep learning", "TensorFlow & Keras", "XGBoost", "Scikit-learn", "Python"]
    },
    awesummly: {
      title: "Awesummly: Topic Modelling",
      category: "Personal",
      link: null,
      description: `Natural Language Processing (NLP)

Constructed an NLP pipeline to automatically categorise news articles into
hierarchical topic trees using advanced text embedding and classification.

Stack: SpaCy, NLTK, GloVe, Rake, Scikit-Learn`,
      stack: ["NLP (spaCy, NLTK)", "Scikit-learn", "Python"]
    }
  },

  contact: {
    email: "varunravivarma@gmail.com",
    github: "https://github.com/v3rm1",
    linkedin: "https://www.linkedin.com/in/varun-ravi-varma",
    orcid: "https://orcid.org/0000-0003-1719-2478",
    location: "Grimstad, Norway"
  }
};
