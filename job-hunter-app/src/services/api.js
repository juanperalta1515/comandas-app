// Cliente API para interactuar con la Netlify Serverless Function

// Datos Mock directos en el cliente para desarrollo local offline o sin Netlify Dev corriendo
const CLIENT_FALLBACK_JOBS = [
  {
    id: "mock-1",
    title: "Senior Full Stack Engineer (.NET & React)",
    company: "Booking.com",
    location: "Amsterdam, Netherlands",
    country: "Netherlands",
    countryCode: "NL",
    description: "We are looking for a Senior Full Stack Engineer with strong experience in C#, .NET Core, SQL Server, and modern frontend frameworks like React. In this role, you will help design and scale services that power millions of bookings daily. Experience with cloud architecture (AWS or Azure) is highly appreciated. We provide full relocation package and EU Blue Card Visa Sponsorship.",
    url: "https://careers.booking.com",
    salary: "€85,000 - €105,000 + bonus",
    postedAt: "Hoy",
    tags: [".NET", "C#", "React", "SQL Server", "Cloud"],
    benefits: ["Visa Sponsorship", "Relocation Package", "30% Ruling Tax Benefit"]
  },
  {
    id: "mock-2",
    title: "Software Developer (C# / .NET / Angular)",
    company: "Delivery Hero",
    location: "Berlin, Germany",
    country: "Germany",
    countryCode: "DE",
    description: "Join the Quick Commerce team! You will develop backend services in C#/.NET Core and rich customer-facing client dashboards using Angular and React. Understanding of SQL Server, PostgreSQL, and microservices architecture is key. This role is open for global candidates; we offer visa sponsorship (EU Blue card) and flights/temporary housing in Berlin.",
    url: "https://careers.deliveryhero.com",
    salary: "€70,000 - €85,000",
    postedAt: "Ayer",
    tags: [".NET", "C#", "Angular", "SQL Server", "Microservices"],
    benefits: ["Visa Sponsorship", "Relocation Assistance", "German Classes"]
  },
  {
    id: "mock-3",
    title: "Senior .NET & Frontend Developer",
    company: "Glovo",
    location: "Barcelona, Spain",
    country: "Spain",
    countryCode: "ES",
    description: "We are seeking a talented .NET / React developer to lead our Logistics dashboard optimization. Strong background in C#, SQL Server, Redis, and React hooks. Must have 3+ years of experience and be ready to move. Visa sponsorship via High Qualified Professional (PAC) pathway is provided for qualified candidates outside the EU.",
    url: "https://jobs.glovoapp.com",
    salary: "€55,000 - €68,000",
    postedAt: "Hace 2 días",
    tags: [".NET", "C#", "React", "SQL Server", "Web APIs"],
    benefits: ["Visa Sponsorship", "Relocation Support", "Private Health Insurance"]
  },
  {
    id: "mock-4",
    title: "Full Stack Software Engineer (.NET Core + React)",
    company: "Adyen",
    location: "Amsterdam, Netherlands",
    country: "Netherlands",
    countryCode: "NL",
    description: "At Adyen, we build the future of payments. We need a Full Stack Developer with robust backend skills in C# and SQL Server, and elegant UI creation using React and Tailwind CSS. We are looking for experienced professionals who are passionate about scaling financial tech. Relocation and visa sponsorship are provided.",
    url: "https://careers.adyen.com",
    salary: "€80,000 - €95,000",
    postedAt: "Hace 3 días",
    tags: [".NET", "C#", "React", "SQL Server", "Fintech"],
    benefits: ["Visa Sponsorship", "Relocation Package", "Stock Options"]
  },
  {
    id: "mock-5",
    title: "Full Stack Engineer (C# / .NET / React)",
    company: "Preply",
    location: "Barcelona, Spain (Hybrid)",
    country: "Spain",
    countryCode: "ES",
    description: "Preply is a global language learning platform. We are looking for a Full Stack engineer who feels at home working with C#, ASP.NET Core, SQL Server databases, and modern React SPAs. Relocation package to Spain, including flight tickets, legal visa processing fees, and temporary accommodation, is covered for candidates.",
    url: "https://preply.com/en/careers",
    salary: "€50,000 - €60,000",
    postedAt: "Hace 4 días",
    tags: [".NET", "C#", "React", "SQL Server", "REST API"],
    benefits: ["Visa Sponsorship", "Relocation Package", "Flexible Hours"]
  },
  {
    id: "mock-6",
    title: "Senior C# Backend & Frontend Developer",
    company: "Zalando",
    location: "Berlin, Germany",
    country: "Germany",
    countryCode: "DE",
    description: "Scale our European e-commerce infrastructure. Expertise in C#, C++ or Java (willing to transition to C#), SQL Server or Postgres, and React/TypeScript. Relocation assistance and support with German work visa (EU Blue Card) are standard for this position.",
    url: "https://jobs.zalando.com",
    salary: "€75,000 - €90,000",
    postedAt: "Hace 5 días",
    tags: [".NET", "C#", "React", "TypeScript", "E-commerce"],
    benefits: ["Visa Sponsorship", "Relocation Package", "Employee Discounts"]
  }
];

export async function fetchJobs(search = '', location = '') {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('q', search);
  if (location) queryParams.append('location', location);

  // En Netlify, el endpoint de redirección es /api/* -> /.netlify/functions/*
  const endpoint = `/api/jobs?${queryParams.toString()}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("No se pudo conectar a la Netlify Function. Ejecutando fallback de cliente para desarrollo local:", error.message);
    
    // Simular retraso de red breve
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filtrar los mocks locales en el cliente
    let filteredJobs = [...CLIENT_FALLBACK_JOBS];
    const searchVal = search.toLowerCase();
    const locVal = location.toLowerCase();

    if (searchVal) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchVal) ||
        job.description.toLowerCase().includes(searchVal) ||
        job.tags.some(t => t.toLowerCase().includes(searchVal))
      );
    }

    if (locVal) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locVal) ||
        job.country.toLowerCase().includes(locVal)
      );
    }

    return filteredJobs;
  }
}
