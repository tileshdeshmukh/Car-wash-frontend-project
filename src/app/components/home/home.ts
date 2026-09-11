import { Component } from '@angular/core';
import { Carousel } from '../carousel/carousel';
import { About } from '../about/about';
import { Service } from '../service/service';
import { Plans } from '../plans/plans';

@Component({
  imports: [Carousel, About, Service, Plans],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
