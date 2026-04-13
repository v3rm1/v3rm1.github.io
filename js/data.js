const DATA = {
  about: `AI Research Scientist and Software Engineer with expertise in multi-agent
reinforcement learning, interpretable decision-making, and scalable AI-driven
systems. Proven track record in designing and optimizing intelligent agents
using neural networks, automaton theory, and continuous control for real-world
applications.

Adept at bridging the gap between theoretical research and production-ready
software, with extensive experience in data analytics, technical consulting,
and collaborative R&D.

Currently pursuing a PhD in Artificial Intelligence at the University of Agder,
Grimstad, Norway. Specializing in Multi-Agent Systems, Reinforcement Learning,
and model interpretability.

Languages: English (Fluent), German (A1-A2 - Learning)`,

  education: [
    {
      institution: "University of Agder",
      degree: "PhD, Artificial Intelligence",
      period: "Current",
      location: "Grimstad, Norway",
      details: [
        "Doctoral Researcher specializing in Multi-Agent Systems (MAS), Reinforcement Learning (RL), and model interpretability.",
        "Developing algorithms for path planning, resource allocation, and trajectory analysis with a focus on emergent dynamics in complex systems."
      ]
    },
    {
      institution: "University of Groningen",
      degree: "M.Sc. Artificial Intelligence",
      period: "2019 - 2021",
      location: "Groningen, Netherlands",
      details: [
        "Specialized in Deep Learning, Automaton Theory, and Reinforcement Learning.",
        "Thesis: Developed an interpretable RL agent using the Regression Tsetlin Machine to provide transparent, logic-based decision-making."
      ]
    },
    {
      institution: "Visveswaraya Technological University",
      degree: "B.E Mechanical Engineering",
      period: "2012 - 2016",
      location: "Karnataka, India",
      details: [
        "Focused on Thermodynamics, Computer-Aided Design (CAD), and mechanical component analysis.",
        "Developed a Peltier-effect solar cell for the final year engineering project."
      ]
    }
  ],

  experience: [
    {
      company: "Sano Centre for Computational Medicine",
      role: "Scientific Programmer - Personal Health Data Science",
      period: "June 2022 - September 2023",
      location: "Krakow, Poland",
      details: [
        "Architected analytical pipelines for medical datasets, leveraging knowledge graphs to infer data relationships for clinical research.",
        "Developed and deployed research tools designed for efficient data consumption and scientific query execution."
      ]
    },
    {
      company: "University of Groningen",
      role: "Graduate Teaching Assistant",
      period: "February 2020 - August 2020",
      location: "Groningen, Netherlands",
      details: [
        "Mentored students in Deep Learning implementations and evaluated technical practical reports.",
        "Facilitated tutorials on the logical aspects of Multi-Agent Systems and reviewed complex course projects."
      ]
    },
    {
      company: "Neudesic Global Services LLC",
      role: "Consultant II - Data Analytics",
      period: "July 2018 - November 2018",
      location: "Bangalore, India",
      details: [
        "Engineered scalable solutions for large-scale data cleansing and deep learning applications.",
        "Designed Proof-of-Concept (PoC) ML models for global clients in the Energy and Finance sectors.",
        "Managed structured and unstructured data migration and analysis across cloud and on-premise infrastructures.",
        "Founded and led an internal upskilling group, conducting weekly sessions on statistics and machine learning."
      ]
    },
    {
      company: "Neudesic Global Services LLC",
      role: "Consultant I - Data Analytics",
      period: "July 2017 - June 2018",
      location: "Bangalore, India",
      details: [
        "Executed data warehousing and advanced analytics projects for diverse industry clients.",
        "Organized office-wide hackathons and technical workshops to drive the adoption of emerging technologies.",
        "Built and demonstrated various technical hobby projects and internal Proof-of-Concepts."
      ]
    },
    {
      company: "Neudesic Global Services LLC",
      role: "Associate Consultant",
      period: "June 2016 - June 2017",
      location: "Bangalore, India",
      details: [
        "Developed PowerShell automation scripts and maintained web application architectures for client projects."
      ]
    }
  ],

  skills: {
    tools: {
      "Analytics & BI": ["Microsoft PowerBI", "Tableau", "Microsoft SSRS", "Matplotlib/Seaborn"],
      "OS & Environments": ["Linux (Debian/Ubuntu)", "Unix", "Git/Version Control"],
      "Databases": ["Microsoft SQL Server", "MongoDB", "MySQL"]
    },
    programming: {
      "Languages": ["Python", "C++", "C#", "Julia"],
      "Frameworks (Scientific & AI)": ["Numpy", "Scipy", "Scikit-Learn", "Pandas", "Tensorflow", "pyTsetlinMachine"]
    },
    competencies: [
      "Data Visualization & Automated Reporting (LaTeX/Markdown)",
      "Multi-Agent System (MAS) Design & Implementation",
      "Logic-Based & Symbolic AI Development",
      "Continuous Learning & Adaptive System Analysis"
    ]
  },

  publications: [
    {
      title: "Noise Robustness Through Abstractions and Its Impact on Machine Learning",
      venue: "IEEE Transactions",
      status: "Under Review",
      doi: null,
      description: "Systematic analysis of data discretization techniques to enhance model robustness against noisy datasets, optimizing performance for real-world ML applications."
    },
    {
      title: "CACTUS: A Comprehensive Abstraction and Classification Tool for Uncovering Structures",
      venue: "ACM Transactions on Intelligent Systems and Technology",
      status: "Published",
      doi: "10.1145/3649459",
      description: "Developed a high-performance analytical pipeline for healthcare data featuring optimized memory management, parallelized computation, and support for high-dimensional categorical attributes."
    },
    {
      title: "SANDA: A Small and Incomplete Dataset Analyser",
      venue: "Elsevier Journal of Information Sciences",
      status: "Published",
      doi: "10.2139/ssrn.4364273",
      description: "Designed an explainable analytical framework specifically for incomplete medical datasets, improving data utility in data-scarce environments."
    },
    {
      title: "Adaptive Pandemic Analysis: An Agent-Based Reinforcement Learning Framework",
      venue: "FAIEMA 2024",
      status: "Published",
      doi: null,
      description: "Architected a conceptual modeling framework using Agent-Based Modeling (ABM) and RL to simulate and analyze the dynamics of complex biological systems."
    }
  ],

  projects: {
    thesis: {
      title: "Interpretable Reinforcement Learning with Regression Tsetlin Machine",
      category: "Research",
      link: null,
      description: `Master's Thesis | University of Groningen
Link: FSE Theses Repository, RUG

Engineered a novel Reinforcement Learning (RL) agent using the Regression
Tsetlin Machine to achieve transparent, logic-based decision-making. Focused
on replacing "black-box" neural networks with propositional logic automata to
reduce computational overhead and increase model interpretability in complex
environments.`
    },
    cogn_mod: {
      title: "Cognitive Modelling: Basic Principles and Methods",
      category: "Research",
      link: "https://github.com/v3rm1/cogn_mod_basic",
      description: `Assignments and Project work for the Cognitive Modelling course offered under
the MSc AI program at the University of Groningen.

We attempt to model an ACT-R (Adaptive Control of Thought - Rational) agent
to study how the model performs in a timing experiment based on the experiment
carried out by Jazayeri and Shadlen.

Temporal learning is modelled as a Bayesian Process with prior experiences
affecting the perception of future temporal signals. The model is built in
Python using the ACT-R theoretical framework.

The experiment alters previous work by utilizing highly skewed base
distributions and removing participant feedback. The model depicted clearly
the expected skew in outputs discussed in the experimentation section.`
    },
    deep_learning: {
      title: "Deep Learning: Reinforcement Learning with Confidence Estimation",
      category: "Research",
      link: "https://github.com/v3rm1/dl2_rl",
      description: `Project work for the Deep Learning course offered under the MSc AI program
at the University of Groningen.

Devised an unconventional method of including confidence estimation in a
reinforcement learning system. The system outputs action/confidence pairs,
where the confidence represents the system's best guess as to the probability
of the action resulting in a successful outcome.

The confidence is trained by altering the reward function such that the reward
is a function of both the real value of the action and the confidence given.
Tested using Proximal Policy Optimization (PPO) on the Atari Pong environment.

Two approaches tested:
  1. Proximal Policy Optimization (PPO)
  2. PPO with Confidence Estimation

The model achieves accurate confidence estimation when the estimated
confidence equals the probability value returned by the Softmax layer.`
    },
    ml_bach: {
      title: "Machine Learning: Completing the Unfinished Bach Fugue",
      category: "Research",
      link: "https://github.com/v3rm1/ml_bach_fugue",
      description: `Project work for the Machine Learning course offered under the MSc AI program
at the University of Groningen.

This project predicts Bach's last fugue using machine learning. Approaches:

  - Simple Bigram model (baseline)
  - Character-level LSTM trained on MIDI-to-text conversions
  - Preprocessing pipeline for MIDI <-> pitch list conversion

The predicted outputs are available in the Generated Music folder.
You can listen to the generated output by playing bigram_output.mid.`
    },
    road_sign: {
      title: "HackerEarth: Road Sign Detection",
      category: "Personal",
      link: null,
      description: `Computer Vision & Classification

Implemented ensemble machine learning models to classify road sign
orientations, utilizing PowerBI for feature correlation analysis and data
distribution mapping.

Stack: XGBoost, Random Forests, Scikit-Learn, Numpy, PowerBI`
    },
    ad_click: {
      title: "HackerEarth: Ad Click Prediction",
      category: "Personal",
      link: null,
      description: `Big Data & Predictive Analytics

Developed a predictive model for user ad-engagement based on historical
request data and geospatial parameters.

Stack: XGBoost, Scikit-Learn, Numpy, Jupyter`
    },
    product_rec: {
      title: "HackerEarth: Product Recognition",
      category: "Personal",
      link: null,
      description: `Deep Learning & CNNs

Leveraged Deep Convolutional Neural Networks (Inception, VGG-19, ResNet) to
automate the classification of retail inventory items.

Stack: Keras, Scikit-Learn, Numpy, Jupyter`
    },
    network_attack: {
      title: "HackerEarth: Network Attack Prediction",
      category: "Personal",
      link: null,
      description: `Cybersecurity AI

Built a security-focused ML model to identify server farm vulnerabilities
and predict potential network attacks using anonymized traffic parameters.

Stack: Keras, XGBoost, Scikit-Learn, Numpy`
    },
    awesummly: {
      title: "Awesummly: Topic Modelling",
      category: "Personal",
      link: null,
      description: `Natural Language Processing (NLP)

Constructed an NLP pipeline to automatically categorize news articles into
hierarchical topic trees using advanced text embedding and classification.

Stack: SpaCy, NLTK, GloVe, Rake, Scikit-Learn`
    }
  },

  contact: {
    email: "varunravivarma@gmail.com",
    github: "https://github.com/v3rm1",
    linkedin: "https://www.linkedin.com/in/varun-ravi-varma-4b183059/",
    orcid: "https://orcid.org/0000-0003-1719-2478",
    location: "Grimstad, Norway"
  }
};
