import React from "react";
import {
  Leaf,
  Heart,
  Calendar,
  TrendingUp,
  Bell,
  Users,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const LandingPage = ({ onGetStarted }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const [showFloatingNav, setShowFloatingNav] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [activeDosha, setActiveDosha] = React.useState("Vata");
  const [activeTreatment, setActiveTreatment] = React.useState("Vamana");

  const handleTreatmentSelect = (treatmentName) => {
    setActiveTreatment(treatmentName);
    const treatmentDetailsElement = document.getElementById("treatment-details");
    if (treatmentDetailsElement) {
      treatmentDetailsElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const handleDoshaSelect = (doshaName) => {
    setActiveDosha(doshaName);
    const doshaDetailsElement = document.getElementById("dosha-details");
    if (doshaDetailsElement) {
      doshaDetailsElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const treatments = [
    {
      name: "Vamana",
      desc: "Therapeutic Emesis",
      icon: "/treatments/vamana.svg",
      image: "/treatments/vamana.jpg",
      details: `When there is congestion in the lungs causing repeated attacks of bronchitis, colds, cough, or asthma, the Ayurvedic treatment is therapeutic vomiting, vamana, to eliminate the kapha causing the excess mucus.

Oftentimes this also releases repressed emotions that have been held in the kapha areas of the lungs and stomach along with the accumulated dosha. Once the mucus is released, the patient will feel instantly relieved.`,
      benefits: [
        "Relief from chronic asthma",
        "Treats diabetes and chronic cold",
        "Helps with lymphatic congestion",
        "Improves chronic indigestion",
        "Reduces edema",
      ],
      results: [
        "Relaxation in lungs",
        "Free breathing",
        "Lightness in chest",
        "Clear thinking",
        "Clear voice",
        "Good appetite",
      ],
    },
    {
      name: "Virechana",
      desc: "Purgation Therapy",
      icon: "/treatments/virechana.svg",
      image: "/treatments/virechana.jpg",
      details: `When excess bile, pitta, is secreted and accumulated in the gallbladder, liver, and small intestine, it tends to result in rashes, skin inflammation, acne, chronic attacks of fever, biliary vomiting, nausea, and jaundice. 

Purgatives help relieve the excess pitta causing the bile disturbance in the body. In fact, purgatives can completely cure the problem of excess pitta.`,
      benefits: [
        "Treats skin inflammation",
        "Helps with chronic fever",
        "Reduces biliary issues",
        "Balances pitta dosha",
        "Improves liver function",
      ],
    },
    {
      name: "Basti",
      desc: "Enema Therapy",
      icon: "/treatments/basti.svg",
      image: "/treatments/basti.jpg",
      details: `Vata is a very active principle in pathogenesis. If we can control vata through the use of basti, we have gone a long way in going to the root cause of the vast majority of diseases. 

The medication administered rectally affects bone tissue. The mucus membrane of the colon is related to the outer covering of the bones, which nourishes them.`,
      benefits: [
        "Controls vata disorders",
        "Affects bone tissue health",
        "Balances elimination processes",
        "Helps with deep tissue healing",
        "Manages various vata conditions",
      ],
    },
    {
      name: "Nasya",
      desc: "Nasal Administration",
      icon: "/treatments/nasya.svg",
      image: "/treatments/nasya.jpg",
      details: `The nose is the doorway to the brain and consciousness. An excess of bodily humors accumulated in the sinus, throat, nose, or head areas is eliminated through the nose. 

Prana enters the body through breath taken in through the nose and maintains sensory and motor functions. It also governs mental activities, memory, and concentration.`,
      benefits: [
        "Treats prana disorders",
        "Relieves sinus congestion",
        "Helps with migraine headaches",
        "Improves sensory perception",
        "Enhances memory and concentration",
      ],
      procedure: [
        "Nasal massage with ghee",
        "Clockwise and counter-clockwise movements",
        "Regular morning and evening practice",
        "Gentle and careful application",
      ],
    },
    {
      name: "Rakta Moksha",
      desc: "Blood Purification",
      icon: "/treatments/raktamoksha.svg",
      image: "/treatments/raktamoksha.jpg",
      details: `Toxins present in the gastrointestinal tract are absorbed into the blood and circulated throughout the body. This condition, called toxemia, is the basic cause of repeated infections and certain circulatory conditions.

This treatment is particularly effective for skin disorders, enlarged liver, spleen, and gout. Pitta and blood have a very close relationship.`,
      benefits: [
        "Purifies blood",
        "Treats skin disorders",
        "Helps with liver enlargement",
        "Manages gout",
        "Stimulates immune system",
      ],
      restrictions: [
        "Sugar",
        "Salt",
        "Yogurt",
        "Sour-tasting foods",
        "Alcohol",
        "Fermented foods",
      ],
    },
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowFloatingNav(scrollPosition > 600);
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const progress = (scrollPosition / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Daily Routine",
      subtitle: "Smart Scheduling",
      description: "Harmonize your therapy sessions with natural rhythms and biorhythms",
      gradient: "from-brand-yellow to-brand-red",
    },
    {
      icon: TrendingUp,
      title: "Progress",
      subtitle: "Wellness Tracking",
      description: "Monitor your journey through the five stages of Panchakarma",
      gradient: "from-brand-teal to-brand-sage-dark",
    },
    {
      icon: Bell,
      title: "Reminders",
      subtitle: "Care Alerts",
      description: "Timely guidance for pre and post-therapy protocols",
      gradient: "from-brand-sage to-brand-teal",
    },
    {
      icon: Heart,
      title: "Wellness",
      subtitle: "Holistic Health",
      description: "Balance the three biological energies - Vata, Pitta, and Kapha",
      gradient: "from-brand-red to-brand-yellow",
    },
  ];

  const benefits = [
    "Personalized protocols based on your body constitution",
    "Track your journey through preparation, core, and recovery stages",
    "Specific dietary recommendations and lifestyle guidelines",
    "Seamless communication with your practitioner",
    "Monitor the balance of biological energies",
    "Access your wellness journey anytime, anywhere with mobile support",
  ];

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Ayurvedic Physician",
      specialty: "Panchakarma Specialist",
      text: "AyurSutra brings the wisdom of ancient Ayurveda into the digital age. The energy tracking and progression monitoring have helped my patients achieve better balance in their healing journey.",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Wellness Seeker",
      specialty: "Recovering from imbalance",
      text: "The personalized care reminders based on my constitution and the detailed tracking of my balance have transformed my healing experience. The app makes following the protocol so much easier.",
      rating: 5,
    },
    {
      name: "Dr. Meera Patel",
      role: "Ayurvedic Center Director",
      specialty: "Director, Ayurveda Center",
      text: "Since implementing AyurSutra, we've seen remarkable improvements in patient adherence to their prescribed regimens. The traditional wisdom combined with modern tracking is truly revolutionary.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E6D3] via-[#FDF6E3] to-[#F3E5AB] relative">
      <div className="absolute inset-0 bg-[url('/patterns/mandala-bg.svg')] opacity-5 pointer-events-none bg-repeat"></div>
      
      <header className="bg-white/60 backdrop-blur-md border-b border-sage-200/50 sticky top-0 z-50">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sage-100">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-red-500 to-teal-600 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-2 rounded-full">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold font-display text-teal-700">
                AyurSutra
              </span>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection("what-is-panchakarma")}
                className="text-sage-700 hover:text-teal-700 font-medium transition-colors cursor-pointer"
              >
                What is Panchakarma?
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-sage-700 hover:text-teal-700 font-medium transition-colors cursor-pointer"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-sage-700 hover:text-teal-700 font-medium transition-colors cursor-pointer"
              >
                Testimonials
              </button>
            </nav>

            <button
              onClick={onGetStarted}
              className="bg-teal-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-800 transition-colors"
            >
              Begin Your Journey
            </button>
          </div>
        </div>
      </header>

      <section className="min-h-screen flex flex-col justify-center pt-10 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-ayurveda-chandana/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-ayurveda-haldi/5 rounded-full blur-2xl -translate-y-1/4 -translate-x-1/4"></div>

        <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center">
          <div className="flex flex-col items-center max-w-3xl w-full relative z-10">
            <h1 className="leading-tight w-full animate-slide-up">
              <div className="text-6xl md:text-7xl lg:text-8xl font-display mb-4">
                <span className="bg-gradient-to-r from-brand-yellow via-brand-red to-brand-teal bg-clip-text text-transparent inline-block">
                  Discover Balance
                </span>
              </div>
              <div className="text-5xl md:text-6xl lg:text-7xl font-display text-brand-teal mt-2">
                Through Panchakarma
              </div>
            </h1>

            <p className="mt-8 text-lg text-brand-sage-dark max-w-2xl leading-relaxed mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
              Experience the harmony of ancient Ayurvedic wisdom empowered by
              modern technology for a transformative healing journey.
            </p>

            <div className="flex justify-center mt-12 animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <button
                onClick={onGetStarted}
                className="group bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white px-8 py-4 rounded-xl shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-300 flex items-center"
              >
                <div className="flex flex-col items-start">
                  <span className="text-lg font-medium">Begin Your Journey</span>
                </div>
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center mt-16 gap-8 sm:gap-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-sage-light/20 rounded-full">
                  <Users className="h-5 w-5 text-brand-sage-dark" />
                </div>
                <div>
                  <span className="text-brand-sage-dark font-medium block">500+</span>
                  <span className="text-sm text-brand-sage">Practitioners</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-sage-light/20 rounded-full">
                  <Heart className="h-5 w-5 text-brand-sage-dark" />
                </div>
                <div>
                  <span className="text-brand-sage-dark font-medium block">10,000+</span>
                  <span className="text-sm text-brand-sage">Patients</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-brand-yellow/10 rounded-full">
                  <Star className="h-5 w-5 text-brand-yellow" />
                </div>
                <div>
                  <span className="text-brand-sage-dark font-medium block">4.9/5</span>
                  <span className="text-sm text-brand-sage">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 relative overflow-hidden">
          <div id="what-is-panchakarma" className="absolute -top-20"></div>
          <div className="relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display mb-4">
                <span>What is </span>
                <span className="bg-gradient-to-r from-brand-red to-brand-teal bg-clip-text text-transparent">Panchakarma?</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-brand-yellow via-brand-red to-brand-teal mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose prose-lg max-w-none">
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-md shadow-elevation-1 animate-fade-in-up">
                  <p className="text-lg text-brand-sage-dark leading-relaxed mb-6">
                    Panchakarma is a treatment program for the body, mind, and
                    consciousness that cleanses and rejuvenates. It is based on
                    Ayurvedic principles, where every human is a unique phenomenon
                    manifested through the five basic elements of Ether, Air,
                    Fire, Water, and Earth.
                  </p>
                </div>

                <div className="relative mt-8 p-8 rounded-2xl bg-brand-sage-light/30 border border-brand-sage-light/20 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                  <p className="text-lg text-brand-sage-dark leading-relaxed">
                    The combination of these elements forms three biological energies (doshas): 
                    <span className="font-medium text-brand-teal"> Vata</span>, 
                    <span className="font-medium text-brand-red"> Pitta</span>, and 
                    <span className="font-medium text-brand-yellow"> Kapha</span>.
                    Balance is unique to each individual, and disturbances result in disease.
                  </p>
                </div>
              </div>

              <div className="relative group animate-fade-in-up" style={{ animationDelay: "1s" }}>
                <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-elevation-2 p-8 transform hover:-translate-y-2 transition-all duration-500">
                  <div className="space-y-8">
                    <h3 className="text-2xl font-display text-brand-sage-dark">The Five Elements</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { element: "Ether", icon: "🌌", color: "from-purple-500/20 to-purple-600/20" },
                        { element: "Air", icon: "💨", color: "from-blue-500/20 to-blue-600/20" },
                        { element: "Fire", icon: "🔥", color: "from-red-500/20 to-red-600/20" },
                        { element: "Water", icon: "💧", color: "from-cyan-500/20 to-cyan-600/20" },
                        { element: "Earth", icon: "🌍", color: "from-green-500/20 to-green-600/20" },
                      ].map((el, index) => (
                        <div key={index} className={`rounded-xl p-5 bg-gradient-to-br ${el.color}`}>
                          <div className="text-3xl mb-3">{el.icon}</div>
                          <div className="text-brand-sage-dark font-medium text-lg">{el.element}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-4">
              Essential Elements of Wellness
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto px-4">
            {[
              { name: "Snehana", icon: "💧", desc: "Oil Therapy" },
              { name: "Swedana", icon: "💨", desc: "Steam Therapy" },
              { name: "Basti", icon: "🌏", desc: "Enema Therapy" },
              { name: "Vamana", icon: "🌊", desc: "Emesis" },
              { name: "Virechana", icon: "🌸", desc: "Purgation" },
              { name: "Nasya", icon: "👃", desc: "Nasal Therapy" },
            ].map((element, index) => (
              <div key={index} className="group relative transform hover:-translate-y-2 transition-all duration-500">
                <div className="relative bg-white rounded-2xl p-6 shadow-elevation-1 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-sage-light/50 to-white flex items-center justify-center text-3xl mb-4">
                    {element.icon}
                  </div>
                  <h3 className="font-medium text-lg text-brand-sage-dark">{element.name}</h3>
                  <p className="text-sm text-brand-sage">{element.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-32 mb-20 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display mb-4">
              <span>The Path to </span>
              <span className="bg-gradient-to-r from-brand-red to-brand-teal bg-clip-text text-transparent">Purification</span>
            </h2>
            <p className="mt-4 text-lg text-brand-sage max-w-3xl mx-auto">
              Experience the transformative journey through three essential phases.
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 relative">
              {[
                {
                  number: "1",
                  title: "Preparation",
                  desc: "Preliminary phase",
                  icon: "🌿",
                  color: "from-brand-yellow to-brand-red",
                  benefits: ["Diet planning", "Lifestyle adjustments", "Mental prep"],
                  features: ["Custom regimen", "Daily routine", "Initial therapies"],
                },
                {
                  number: "2",
                  title: "Main Therapies",
                  desc: "Primary cleansing phase",
                  icon: "✨",
                  color: "from-brand-red to-brand-teal",
                  benefits: ["Deep cleansing", "Toxin elimination", "Energy balancing"],
                  features: ["Core treatments", "Healing sessions", "Clinical monitoring"],
                },
                {
                  number: "3",
                  title: "Rejuvenation",
                  desc: "Post-treatment recovery",
                  icon: "🌸",
                  color: "from-brand-teal to-brand-sage-dark",
                  benefits: ["Restored vitality", "Enhanced immunity", "Wellness"],
                  features: ["Recovery support", "Maintenance", "Follow-up care"],
                },
              ].map((step, index) => (
                <div key={index} className="flex-1 relative z-10 group">
                  <div className="h-full bg-white rounded-2xl p-8 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-500">
                    <div className="relative mb-6 text-center">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-4xl`}>
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-medium text-brand-sage-dark mt-4">{step.title}</h3>
                      <p className="text-sm text-brand-sage">({step.desc})</p>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-brand-teal mb-3">Benefits</h4>
                        {step.benefits.map((b, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-brand-sage-dark">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-brand-teal mb-3">Features</h4>
                        {step.features.map((f, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-brand-sage-dark">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-yellow"></div>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-display text-brand-sage-dark mb-4">Ayurvedic Biological Energies</h3>
              <p className="text-lg text-brand-sage max-w-3xl mx-auto">Understanding imbalances is the basis for treatment.</p>
            </div>

            <div className="flex justify-center gap-8 mb-12">
              {[
                { name: "Vata", icon: "🌪️", element: "Air & Ether" },
                { name: "Pitta", icon: "🔥", element: "Fire & Water" },
                { name: "Kapha", icon: "🌊", element: "Earth & Water" },
              ].map((dosha) => (
                <div key={dosha.name} className="text-center cursor-pointer min-w-[120px]" onClick={() => handleDoshaSelect(dosha.name)}>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 bg-white shadow-md ${activeDosha === dosha.name ? "ring-2 ring-brand-teal" : ""}`}>
                    {dosha.icon}
                  </div>
                  <h4 className="text-xl font-medium">{dosha.name}</h4>
                  <p className="text-sm text-brand-sage">{dosha.element}</p>
                </div>
              ))}
            </div>

            <div id="dosha-details" className="bg-white rounded-2xl p-8 shadow-elevation-2">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-medium text-brand-red mb-4">Out of Balance</h4>
                  <ul className="space-y-2">
                    {activeDosha === "Vata" && ["constipation", "weakness", "insomnia", "worry"].map((item, i) => (
                      <li key={i} className="flex items-center space-x-2 text-brand-sage-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                    {activeDosha === "Pitta" && ["skin inflammation", "fever", "anger"].map((item, i) => (
                      <li key={i} className="flex items-center space-x-2 text-brand-sage-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                    {activeDosha === "Kapha" && ["excessive sleep", "congestion", "lethargy"].map((item, i) => (
                      <li key={i} className="flex items-center space-x-2 text-brand-sage-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xl font-medium text-brand-teal mb-4">In Balance</h4>
                  <ul className="space-y-2">
                    {activeDosha === "Vata" && ["creative", "energetic", "flexible"].map((item, i) => (
                      <li key={i} className="flex items-center space-x-2 text-brand-sage-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                    {activeDosha === "Pitta" && ["intelligent", "focused", "warm"].map((item, i) => (
                      <li key={i} className="flex items-center space-x-2 text-brand-sage-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                    {activeDosha === "Kapha" && ["stamina", "patient", "steady"].map((item, i) => (
                      <li key={i} className="flex items-center space-x-2 text-brand-sage-dark">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-display text-brand-sage-dark">Panchakarma Treatments</h3>
            </div>

            <div id="treatment-details" className="bg-white rounded-2xl p-8 shadow-elevation-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {treatments.map((treatment) => (
                    <button
                      key={treatment.name}
                      onClick={() => handleTreatmentSelect(treatment.name)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${activeTreatment === treatment.name ? "bg-brand-sage-light/20 border-l-4 border-brand-teal" : "hover:bg-gray-50"}`}
                    >
                      <h4 className="font-medium text-lg">{treatment.name}</h4>
                      <p className="text-sm text-brand-sage">{treatment.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  {activeTreatment && (
                    <div className="animate-fade-in">
                      <h3 className="text-2xl font-display mb-4">{activeTreatment}</h3>
                      <p className="text-brand-sage-dark mb-6">{treatments.find(t => t.name === activeTreatment).details}</p>
                      <h4 className="font-medium text-brand-teal mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {treatments.find(t => t.name === activeTreatment).benefits.map((b, i) => (
                          <li key={i} className="text-sm flex items-center space-x-2">
                            <div className="w-1 h-1 bg-brand-teal rounded-full"></div>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-display mb-6">Essential Elements of Wellness</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-display mb-6">The Path to Wellness</h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-brand-red" />
                  <span className="text-gray-700 text-lg">{benefit}</span>
                </div>
              ))}
            </div>
            <button onClick={onGetStarted} className="mt-8 bg-teal-700 text-white px-8 py-4 rounded-full font-semibold">
              Sign Up
            </button>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Wellness Progress</div>
              <div className="w-full bg-gray-200 h-3 rounded-full">
                <div className="bg-teal-600 h-3 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500">Next Session</div>
                <div className="font-medium">Oil Massage</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500">Wellness Score</div>
                <div className="font-medium">8.5/10</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="text-4xl font-display">Testimonials</h2>
        </div>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />)}
              </div>
              <p className="text-gray-700 mb-6 italic">"{t.text}"</p>
              <div className="font-bold">{t.name}</div>
              <div className="text-brand-red text-sm">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-teal-800 text-white text-center">
        <h2 className="text-4xl font-display mb-6">Begin Your Healing Journey</h2>
        <p className="mb-8 max-w-2xl mx-auto">Join our community on the path to holistic wellness.</p>
        <button onClick={onGetStarted} className="bg-white text-teal-800 px-8 py-4 rounded-full font-bold">
          Sign Up Now
        </button>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="text-white font-bold text-xl mb-4">AyurSutra</div>
            <p className="text-sm">Health is the greatest blessing.</p>
          </div>
          <div>
            <h3 className="text-white mb-4">Services</h3>
            <ul className="text-sm space-y-2">
              <li>Panchakarma Tracking</li>
              <li>Constitutional Analysis</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white mb-4">Support</h3>
            <ul className="text-sm space-y-2">
              <li>Knowledge Base</li>
              <li>Help Center</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white mb-4">Connect</h3>
            <ul className="text-sm space-y-2">
              <li>Our Mission</li>
              <li>Privacy Promise</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 border-t border-gray-800 pt-8 text-xs">
          &copy; 2025 AyurSutra. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;