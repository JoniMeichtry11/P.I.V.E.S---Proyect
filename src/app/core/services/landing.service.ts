import { Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { LandingContent } from '../models/landing.model';

@Injectable({
  providedIn: 'root'
})
export class LandingService {
  private readonly collectionName = 'settings';
  private readonly documentId = 'landing';
  private readonly cacheKey = 'pives_landing_content';

  private defaultContent: LandingContent = {
    hero: {
      badge: 'Programa Infantil de Vialidad y Educación Vial',
      title1: 'Educación Vial',
      title2: 'que salva vidas',
      description: 'P.I.V.E.S. es una plataforma interactiva y gamificada que enseña a los niños y sus familias sobre seguridad vial de una manera divertida, segura y educativa. ¡Aprendé jugando y convertite en un conductor responsable!',
      btn1: 'Comenzar ahora',
      btn2: 'Ya tengo una cuenta'
    },
    about: {
      badge: 'Conocé el Proyecto',
      title: '¿Qué es P.I.V.E.S.?',
      description: 'El Programa Infantil de Vialidad y Educación Vial es una iniciativa educativa que combina tecnología, juegos interactivos y experiencias prácticas para enseñar a los más chicos las reglas de tránsito, la importancia de la seguridad vial y la responsabilidad ciudadana.',
      missionTitle: 'Misión',
      missionDesc: 'Formar conductores y peatones responsables desde la infancia, creando conciencia vial en toda la familia.',
      visionTitle: 'Visión',
      visionDesc: 'Un futuro con cero accidentes viales gracias a la educación temprana, lúdica y familiar.',
      methodTitle: 'Método',
      methodDesc: 'Aprender jugando: cuestionarios interactivos, recompensas, pista de conducción real y acciones familiares.'
    },
    features: {
      badge: 'Todo en un solo lugar',
      title: '¿Qué ofrece P.I.V.E.S.?',
      items: [
        {
          title: 'Desafíos de Señales',
          description: 'Respondé cuestionarios interactivos sobre señales de tránsito y reglas viales. Ganá "Ruedas" por cada respuesta correcta y desbloqueá hitos.'
        },
        {
          title: 'Pista de Conducción Real',
          description: 'Agendá turnos para que tus hijos conduzcan autos eléctricos reales en una pista segura y supervisada. ¡La experiencia más emocionante!'
        },
        {
          title: 'Sistema de Recompensas',
          description: 'Ganá Ruedas, Volantes y desbloqueá documentos ficticios (licencia, seguro, tarjeta verde). Equipá accesorios a tu avatar y personalizá tu perfil.'
        },
        {
          title: 'Control Familiar',
          description: 'Los padres crean perfiles para cada hijo, supervisan su progreso y los acompañan en su camino de aprendizaje seguro y divertido.'
        },
        {
          title: 'Mapa de Eventos',
          description: 'Encontrá en el mapa interactivo las próximas prácticas, talleres, presentaciones y competencias de educación vial cerca tuyo.'
        },
        {
          title: 'Acciones de Copiloto',
          description: 'Actividades familiares que refuerzan los conceptos viales en la vida cotidiana. Padres e hijos aprenden juntos cómo ser mejores en la vía.'
        }
      ]
    },
    institutions: {
      badge: 'Respaldo Institucional',
      title: 'Instituciones que nos apoyan',
      description: 'Organizaciones e instituciones que creen en la educación vial y respaldan el proyecto P.I.V.E.S.'
    },
    businesses: {
      badge: 'Aliados Comerciales',
      title: 'Comercios que nos acompañan',
      description: 'Negocios y emprendimientos locales que apoyan la educación vial infantil y forman parte de la comunidad P.I.V.E.S.'
    },
    sponsors: {
      badge: 'Con el apoyo de',
      title: 'Nuestros Auspiciantes',
      description: 'Empresas y marcas que hacen posible que la educación vial llegue a más familias.'
    },
    steps: {
      badge: 'Empezar es gratis',
      title: 'Es muy fácil empezar',
      items: [
        {
          title: 'Registrate',
          description: 'Creá una cuenta gratuita como padre o tutor en menos de un minuto.'
        },
        {
          title: 'Creá Perfiles',
          description: 'Agregá a tus hijos para que cada uno tenga su propia experiencia y progreso.'
        },
        {
          title: '¡A Aprender!',
          description: 'Los niños exploran desafíos interactivos, ganan recompensas y pueden manejar en la pista real.'
        }
      ]
    },
    cta: {
      title: '¿Listo para formar a los conductores del mañana?',
      description: 'Únete a cientos de familias que ya están enseñando a sus hijos la importancia de la educación vial de forma amena y segura.',
      btn: 'Crear Cuenta Gratis'
    }
  };

  constructor(private firebaseService: FirebaseService) {}

  getDefaultContent(): LandingContent {
    return { ...this.defaultContent };
  }

  /**
   * Obtiene el contenido de la landing con estrategia stale-while-revalidate.
   * - Si hay datos en caché, los devuelve inmediatamente.
   * - En paralelo, consulta Firestore y si los datos cambiaron, invoca el callback `onUpdate`.
   * - Si no hay caché, espera la respuesta de Firestore.
   */
  async getLandingContent(onUpdate?: (content: LandingContent) => void): Promise<LandingContent> {
    const cached = this.getCachedContent();

    if (cached) {
      // Revalidar en background
      this.fetchFromFirestore().then(fresh => {
        if (fresh && !this.isEqual(cached, fresh)) {
          this.saveToCache(fresh);
          onUpdate?.(fresh);
        }
      }).catch(err => {
        console.warn('Error revalidating landing content from Firestore:', err);
      });
      return cached;
    }

    // Sin caché: esperar Firestore
    try {
      const content = await this.fetchFromFirestore();
      if (content) {
        this.saveToCache(content);
        return content;
      }
      return this.defaultContent;
    } catch (error) {
      console.warn('Could not read landing content from Firestore (permission or offline). Using default content.', error);
      return this.defaultContent;
    }
  }

  /**
   * Busca el contenido directamente en Firestore.
   */
  private async fetchFromFirestore(): Promise<LandingContent | null> {
    try {
      const reference = doc(
        this.firebaseService.firestore,
        this.collectionName,
        this.documentId
      );
      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data() as LandingContent;
      } else {
        // Si no existe, intentar escribir los defaults
        try {
          await this.updateLandingContent(this.defaultContent);
        } catch {
          // Unauthenticated or restricted users won't be able to write, which is expected
        }
        return this.defaultContent;
      }
    } catch (error) {
      console.warn('Could not read landing content from Firestore (permission or offline).', error);
      return null;
    }
  }

  async updateLandingContent(content: LandingContent): Promise<void> {
    const reference = doc(
      this.firebaseService.firestore,
      this.collectionName,
      this.documentId
    );
    await setDoc(reference, content);
    // Actualizar caché al guardar desde admin
    this.saveToCache(content);
  }

  /**
   * Lee el contenido cacheado del localStorage de forma sincrónica.
   * Útil para hidratar la UI antes del primer render y evitar el spinner.
   */
  getCachedContent(): LandingContent | null {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      if (!raw) return null;
      return JSON.parse(raw) as LandingContent;
    } catch {
      return null;
    }
  }

  /**
   * Guarda el contenido en localStorage.
   */
  private saveToCache(content: LandingContent): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(content));
    } catch {
      // localStorage lleno o no disponible, no es crítico
    }
  }

  /**
   * Compara dos objetos LandingContent para detectar cambios.
   */
  private isEqual(a: LandingContent, b: LandingContent): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
