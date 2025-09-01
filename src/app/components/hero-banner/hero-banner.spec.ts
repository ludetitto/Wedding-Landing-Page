import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroBanner } from './hero-banner';

describe('HeroBanner', () => {
  let component: HeroBanner;
  let fixture: ComponentFixture<HeroBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
