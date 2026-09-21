export interface LandingConfig {
  hero: {
    tag: string;
    title1: string;
    title2: string;
    subtitle: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    footerText: string;
    footerLinkText: string;
    imageUrl: string;
  };
  pilares: {
    pilar1: string;
    pilar2: string;
    pilar3: string;
    subtitle: string;
  };
  elDesafio: {
    tag: string;
    title1: string;
    title2: string;
    text1: string;
    text2: string;
    imageUrl: string;
  };
  proposito: {
    tag: string;
    title1: string;
    title2: string;
    text: string;
    pilar1: string;
    pilar2: string;
    pilar3: string;
  };
  queEsPives: {
    tag: string;
    title1: string;
    title2: string;
    text: string;
    buttonText: string;
    imageUrl: string;
  };
  comoFunciona: {
    tag: string;
    title: string;
    step1Title: string;
    step1Text: string;
    step2Title: string;
    step2Text: string;
    step3Title: string;
    step3Text: string;
    step4Title: string;
    step4Text: string;
  };
  familias: {
    tag: string;
    title1: string;
    title2: string;
    text: string;
    buttonText: string;
    item1Title: string;
    item1Text: string;
    item2Title: string;
    item2Text: string;
    item3Title: string;
    item3Text: string;
  };
  espaciosEducativos: {
    title1: string;
    title2: string;
    item1Title: string;
    item1Text: string;
    item2Title: string;
    item2Text: string;
    item3Title: string;
    item3Text: string;
  };
  objetivo: {
    title: string;
    text: string;
    pilar1: string;
    pilar2: string;
    pilar3: string;
  };
  ctaFinal: {
    title: string;
    text: string;
    primaryButtonText: string;
    secondaryButtonText: string;
  };
  sponsors: {
    showSponsors: boolean;
    title: string;
    text: string;
  };
  footer: {
    subtitle: string;
    loginText: string;
    copyrightText: string;
  };
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  hero: {
    tag: 'Educación vial',
    title1: 'Educación vial',
    title2: 'desde la infancia.',
    subtitle: 'Una propuesta educativa que promueve conocimientos, hábitos y comportamientos seguros para una movilidad responsable.',
    primaryButtonText: 'Conocer PIVES',
    secondaryButtonText: 'Ingresar a la plataforma',
    footerText: '¿Todavía no tenés cuenta?',
    footerLinkText: 'Registrate gratis',
    imageUrl: 'niños-senda.png'
  },
  pilares: {
    pilar1: 'Educación',
    pilar2: 'Prevención',
    pilar3: 'Convivencia',
    subtitle: 'Construir una cultura de movilidad segura comienza temprano.'
  },
  elDesafio: {
    tag: 'El desafío',
    title1: 'La movilidad forma parte',
    title2: 'de nuestra vida cotidiana.',
    text1: 'Desde los primeros años aprendemos a movernos, a compartir el espacio público y a relacionarnos con nuestro entorno.',
    text2: 'La educación vial es una herramienta fundamental para acompañar ese aprendizaje y promover comportamientos seguros desde la infancia.',
    imageUrl: '/el-desafio.png'
  },
  proposito: {
    tag: 'Nuestro propósito',
    title1: 'Promover una cultura de movilidad',
    title2: 'segura desde la infancia.',
    text: 'PIVES acerca la educación vial a niños y niñas mediante una propuesta educativa apoyada en herramientas digitales, con el objetivo de favorecer aprendizajes que puedan trasladarse a situaciones de la vida cotidiana.',
    pilar1: 'Educación',
    pilar2: 'Prevención',
    pilar3: 'Participación'
  },
  queEsPives: {
    tag: 'Qué es PIVES',
    title1: 'Una herramienta educativa',
    title2: 'al servicio de la educación vial.',
    text: 'PIVES utiliza recursos digitales para acercar contenidos de educación vial de una manera accesible, interactiva y significativa.',
    buttonText: 'Conocer la propuesta',
    imageUrl: '/que-piveshd.png'
  },
  comoFunciona: {
    tag: 'Cómo funciona',
    title: 'Aprender. Comprender. Incorporar.',
    step1Title: 'Explorar',
    step1Text: 'Situaciones cotidianas de la vida real.',
    step2Title: 'Aprender',
    step2Text: 'Conceptos de movilidad segura.',
    step3Title: 'Reflexionar',
    step3Text: 'Comprender por qué es importante.',
    step4Title: 'Aplicar',
    step4Text: 'Llevar los aprendizajes a la vida real.'
  },
  familias: {
    tag: 'Para familias',
    title1: 'El aprendizaje también continúa',
    title2: 'fuera de la plataforma.',
    text: 'La participación de las familias permite conectar los contenidos de educación vial con situaciones reales de la vida cotidiana.',
    buttonText: 'Propuesta para familias',
    item1Title: 'Conocer',
    item1Text: 'Comprender qué contenidos aborda PIVES.',
    item2Title: 'Acompañar',
    item2Text: 'Conversar y reflexionar sobre situaciones cotidianas.',
    item3Title: 'Aplicar',
    item3Text: 'Trasladar los aprendizajes al entorno real.'
  },
  espaciosEducativos: {
    title1: 'Una propuesta que puede integrarse',
    title2: 'a distintos espacios educativos.',
    item1Title: 'Familias',
    item1Text: 'Acompañamiento del aprendizaje desde el hogar.',
    item2Title: 'Escuelas',
    item2Text: 'Una herramienta complementaria para trabajar educación vial.',
    item3Title: 'Instituciones',
    item3Text: 'Un recurso para iniciativas de prevención y movilidad segura.'
  },
  objetivo: {
    title: 'Nuestro objetivo',
    text: 'Contribuir a que más niños y niñas tengan acceso a experiencias de educación vial y puedan incorporar herramientas para una movilidad más segura.',
    pilar1: 'Educar',
    pilar2: 'Prevenir',
    pilar3: 'Generar conciencia'
  },
  ctaFinal: {
    title: 'Construyamos una movilidad más segura.',
    text: 'La educación vial es una responsabilidad compartida. Promoverla desde la infancia es una oportunidad para construir mejores hábitos y una convivencia más segura.',
    primaryButtonText: 'Conocer PIVES',
    secondaryButtonText: 'Ingresar a la plataforma'
  },
  sponsors: {
    showSponsors: true,
    title: 'Acompañan este proyecto',
    text: 'Agradecemos a las instituciones y comercios que hacen posible este proyecto.'
  },
  footer: {
    subtitle: 'Educación vial desde la infancia.',
    loginText: 'Ingresar a PIVES',
    copyrightText: '© 2026 PIVES  | Educacion vial y prevencion'
  }
};
