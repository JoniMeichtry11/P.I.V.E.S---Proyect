export interface LandingContent {
  hero: {
    badge: string;
    title1: string;
    title2: string;
    description: string;
    btn1: string;
    btn2: string;
  };
  about: {
    badge: string;
    title: string;
    description: string;
    missionTitle: string;
    missionDesc: string;
    visionTitle: string;
    visionDesc: string;
    methodTitle: string;
    methodDesc: string;
  };
  features: {
    badge: string;
    title: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  institutions: {
    badge: string;
    title: string;
    description: string;
  };
  businesses: {
    badge: string;
    title: string;
    description: string;
  };
  sponsors: {
    badge: string;
    title: string;
    description: string;
  };
  steps: {
    badge: string;
    title: string;
    items: {
      title: string;
      description: string;
    }[];
  };
  cta: {
    title: string;
    description: string;
    btn: string;
  };
}
