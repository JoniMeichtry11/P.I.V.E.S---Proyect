import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css'],
  standalone: false
})
export class LandingPage implements OnInit {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Proyecto P.I.V.E.S. - Educación que salva vidas');
    this.meta.updateTag({ name: 'description', content: 'Proyecto P.I.V.E.S. es una aplicación interactiva dedicada a la educación vial para niños y familias, fomentando la seguridad y prevención de accidentes.' });
    this.meta.updateTag({ name: 'keywords', content: 'educación vial, niños, seguridad, prevención, pives, proyecto pives' });
  }
}
