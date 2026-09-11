import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; // Ensure this is imported

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {}
