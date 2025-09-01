import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftsSection } from './gifts-section';

describe('GiftsSection', () => {
  let component: GiftsSection;
  let fixture: ComponentFixture<GiftsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
