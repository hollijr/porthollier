import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'img[ph-scroll]'
})
export class ScrollDirective {

  @HostListener('window:scroll') onScroll() {
    console.log('scroll occurred');
  }

}