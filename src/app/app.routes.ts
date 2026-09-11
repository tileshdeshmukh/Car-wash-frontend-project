import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { About } from './components/about/about';
import { Profile } from './components/profile/profile';
import { Mybooking } from './components/my-booking/my-booking';
import { Login } from './components/login/login';
import { authGuard } from './services/auth.guard'; 
import { booknow } from './components/booknow/booknow';

export const routes: Routes = [
    // Public Routes (Anyone can visit these)
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'about', component: About },
    { path: 'login', component: Login }, // 3. Register the animated login path
    //  { path: 'booknow', component: booknow},
    // Protected Routes (Only accessible when logged in)
   { path: 'booknow', component: booknow, canActivate: [authGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: 'mybooking', component: Mybooking, canActivate: [authGuard] },

    // Wildcard Fallback Error Route
    { path: '**', component: PageNotFound  },
];
