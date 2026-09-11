import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Booknow } from './booknow'

describe('Booknow', () => {
  let component: Booknow;
  let fixture: ComponentFixture<Booknow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Booknow],
    }).compileComponents();

    fixture = TestBed.createComponent(Booknow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
