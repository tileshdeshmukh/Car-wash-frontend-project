import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar'; // 1. Import statement
import { Footer } from './components/footer/footer';


@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Navbar, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-learn-project');
}
