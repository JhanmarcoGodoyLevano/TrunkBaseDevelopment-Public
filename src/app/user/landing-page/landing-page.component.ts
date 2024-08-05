import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

declare var $: any;

interface SacramentalService {
  icon: string;
  title: string;
  description: string;
}

interface Project {
  name: string;
  category: string;
  image: string;
}

interface TeamMember {
  image: string;
  name: string;
  role: string;
}

interface Testimonial {
  clientName: string;
  role: string;
  message: string;
  image: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit, OnDestroy, AfterViewInit {
  currentSlideIndex = 0;
  slideInterval: any;
  owlInterval: any;
  testimonialIndex = 0;
  currentTestimonial: Testimonial;

  testimonials: Testimonial[] = [
    {
      clientName: 'Francisco Rodríguez',
      role: 'Parraco',
      message:
        'Siempre me ha fascinado el misterio de la fe y el poder transformador del amor de Dios. Convertirme en sacerdote fue la manera natural de responder a este llamado divino. En mi ministerio, he tenido la oportunidad de presenciar milagros, consolar a los afligidos y celebrar la alegría de la fe con innumerables personas. Ser sacerdote es un privilegio y una gracia inmerecida que me llena de profunda gratitud.',
      image: './assets/testimonial-1.png',
    },
    {
      clientName: 'Antonio Sánchez',
      role: 'Vicarios',
      message:
        'Soy sacerdote misionero y he dedicado mi vida a servir a las comunidades más pobres y necesitadas. He visto de cerca el sufrimiento y la injusticia, pero también he sido testigo de la increíble fuerza y resiliencia del espíritu humano. Ser sacerdote en las misiones es un desafío constante, pero también es una valiosa oportunidad única, gratificante y enriquecedora para vivir el Evangelio en su forma más pura.',
      image: './assets/testimonial-2.png',
    },
  ];

  sacramentalServices: SacramentalService[] = [
    {
      icon: 'fas fa-child',
      title: 'Bautismo',
      description:
        'Ceremonia mediante la cual una persona se incorpora a la comunidad cristiana, recibiendo perdón del pecado original en la fe católica.',
    },
    {
      icon: 'fas fa-dove',
      title: 'Confirmación',
      description:
        'Sacramento que fortalece la gracia bautismal, capacitando al fiel para ser testigo valiente de Cristo y comprometiéndolo aún más con la vida cristiana.',
    },
    {
      icon: 'fas fa-heart',
      title: 'Matrimonio',
      description:
        'Celebración sacramental del amor entre un hombre y una mujer, que establece una unión sagrada y compromiso mutuo ante Dios y la Iglesia.',
    },
    {
      icon: 'fas fa-water',
      title: 'Comunión',
      description:
        'Recepción del Cuerpo y Sangre de Cristo en pan y vino, nutre espiritualmente a los fieles y fortalece su unión con Cristo y la comunidad cristiana.',
    },
  ];

  projects: Project[] = [
    {
      name: 'Memoria Histórica',
      category: 'instalaciones',
      image: './assets/portada-1.jpg',
    },
    {
      name: 'Registro Visual',
      category: 'sacerdotes',
      image: './assets/sacerdote-2.jpeg',
    },
    {
      name: 'Comunicación Efectiva',
      category: 'proximamente',
      image: './assets/proximamente-1.jpg',
    },
    {
      name: 'Conexión Comunitaria',
      category: 'sacerdotes',
      image: './assets/sacerdote-1.jpg',
    },
    {
      name: 'Apreciación Estética',
      category: 'instalaciones',
      image: './assets/portada-2.jpg',
    },
    {
      name: 'Inspiración Espiritual',
      category: 'proximamente',
      image: './assets/proximamente-2.jpeg',
    },
  ];

  filteredProjects: Project[] = [];

  teamMembers: TeamMember[] = [
    {
      image: './assets/team-1.jpg',
      name: 'Jesús Manuel Escate Padilla',
      role: 'Párroco',
    },
    {
      image: './assets/team-2.jpg',
      name: 'Thomas Huckeman Benfey',
      role: 'Vicarios',
    },
    {
      image: './assets/team-3.jpg',
      name: 'Jesús Colquepisco Chumpitaz',
      role: 'Vicarios',
    },
    {
      image: './assets/team-4.jpg',
      name: 'Jhair Pérez Lizarme Castro',
      role: 'Vicarios',
    },
  ];

  visibleTeamMembers: TeamMember[] = [];

  constructor() {
    this.currentTestimonial = this.testimonials[this.testimonialIndex];
  }

  ngOnInit() {
    this.filterCategory('*');
    this.startCarousel();
    this.initializeCarousels();
    this.setVisibleTeamMembers();
    this.startTeamCarousel();
  }

  ngOnDestroy() {
    clearInterval(this.slideInterval);
    clearInterval(this.owlInterval);
  }

  ngAfterViewInit() {
    this.initializeCarousels();
  }

  startCarousel() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 2000);
  }

  nextSlide() {
    const slides = document.querySelectorAll('.carousel-item');
    slides[this.currentSlideIndex].classList.remove('active');
    this.currentSlideIndex = (this.currentSlideIndex + 1) % slides.length;
    slides[this.currentSlideIndex].classList.add('active');
  }

  prevSlide() {
    const slides = document.querySelectorAll('.carousel-item');
    slides[this.currentSlideIndex].classList.remove('active');
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + slides.length) % slides.length;
    slides[this.currentSlideIndex].classList.add('active');
  }

  initializeCarousels() {
    setTimeout(() => {
      $('.service-carousel').owlCarousel({
        items: 1,
        loop: true,
        margin: 20,
        nav: false,
        dots: false,
        autoplay: true,
        autoplayTimeout: 4000,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
      });
      this.owlInterval = setInterval(() => {
        $('.service-carousel').trigger('next.owl.carousel');
      }, 4000);
    }, 100);
  }

  filterCategory(category: string) {
    if (category === '*') {
      this.filteredProjects = this.projects;
    } else {
      this.filteredProjects = this.projects.filter(
        (project) => project.category === category
      );
    }
    const filterButtons = document.querySelectorAll('.btn-filter');
    filterButtons.forEach((button) => {
      button.classList.remove('active');
      if (button.getAttribute('data-filter') === category) {
        button.classList.add('active');
      }
    });
  }

  setVisibleTeamMembers() {
    this.visibleTeamMembers = this.teamMembers.slice(
      this.currentSlideIndex,
      this.currentSlideIndex + 3
    );
    if (this.visibleTeamMembers.length < 3) {
      this.visibleTeamMembers = this.visibleTeamMembers.concat(
        this.teamMembers.slice(0, 3 - this.visibleTeamMembers.length)
      );
    }
  }

  startTeamCarousel() {
    this.slideInterval = setInterval(() => {
      this.nextTeamSlide();
    }, 4000);
  }

  nextTeamSlide() {
    this.currentSlideIndex =
      (this.currentSlideIndex + 1) % this.teamMembers.length;
    this.setVisibleTeamMembers();
  }

  prevTeamSlide() {
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.teamMembers.length) %
      this.teamMembers.length;
    this.setVisibleTeamMembers();
  }

  nextTestimonial() {
    this.testimonialIndex =
      (this.testimonialIndex + 1) % this.testimonials.length;
    this.currentTestimonial = this.testimonials[this.testimonialIndex];
  }

  prevTestimonial() {
    this.testimonialIndex =
      (this.testimonialIndex - 1 + this.testimonials.length) %
      this.testimonials.length;
    this.currentTestimonial = this.testimonials[this.testimonialIndex];
  }
}
