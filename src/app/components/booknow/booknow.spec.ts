import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Booknow } from './booknow';

describe('Booknow', () => {
  let component: Booknow;
  let fixture: ComponentFixture<Booknow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Booknow],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Booknow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
