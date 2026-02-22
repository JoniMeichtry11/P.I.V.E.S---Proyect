import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  constructor(private titleService: Title, private metaService: Meta) { }

  updateTags(config: { title?: string, description?: string, image?: string, url?: string }) {
    const siteName = 'Proyecto P.I.V.E.S.';
    const fullTitle = config.title ? `${config.title} | ${siteName}` : siteName;

    this.titleService.setTitle(fullTitle);

    if (config.description) {
      this.metaService.updateTag({ name: 'description', content: config.description });
      this.metaService.updateTag({ property: 'og:description', content: config.description });
      this.metaService.updateTag({ property: 'twitter:description', content: config.description });
    }

    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'twitter:title', content: fullTitle });

    if (config.image) {
      this.metaService.updateTag({ property: 'og:image', content: config.image });
      this.metaService.updateTag({ property: 'twitter:image', content: config.image });
    }

    if (config.url) {
      this.metaService.updateTag({ property: 'og:url', content: config.url });
      this.metaService.updateTag({ property: 'twitter:url', content: config.url });
    }
  }
}
