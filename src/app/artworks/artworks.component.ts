import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Art } from './art';
import { ArtworkService } from '../services/artwork.service';  // model
import { Category } from './category';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-artworks',
  templateUrl: './artworks.component.html',
  styleUrls: ['../projects/project-styles.css', './artworks.component.css'],
})
export class ArtworksComponent implements OnInit {

  ngOnInit():void {
    this.getArtworks(); 

    // subscribe to params that are returned from artwork-details
    // so you can highlight the last selected item
    this.route.params.forEach((params:Params) => {
      // + converts the 'id' string to a number
      let id = +params['artid'];
      this.selectedArtwork = id;
      console.log("returned id of " + id + ", selected " + this.selectedArtwork);
    });
    
    // subscribe to fragment observable to redirect on page
    this.route.fragment.forEach((frag: string) => {
      this.fragment = frag;
      if (frag) {
          const element = document.querySelector("#" + frag);
          if (element) { 
            element.scrollIntoView(true);  // experimental method
            console.log('scrolled to ' + frag + ", element: " + element);
          }
        }
    }); 
    
    this.images = new Array();
    this.loaded = new Array();
  }

  // this constructor adds a private property that is of type projectService to the 
  // AppComponent class. It's a projectService injection site.
  constructor(
    private artworkService:ArtworkService,
    private categoryService:CategoryService,
    private router:Router,
    private route:ActivatedRoute) { }

  categories:Category[];
  selectedCategory:Category;
  selectedArtwork:number;
  artworks:[Art[]];
  innerWidth:number = window.innerWidth;
  fragment:string;
  images;
  loaded:Art[] = new Array();
  arrayIsReversed:boolean;
  imageCt:number;

  onSelect(artwork:Art): void {
    this.selectedArtwork = artwork.id;
  }

  isSelected(id:number) {
    if (id === this.selectedArtwork) {
      console.log("selected: " + id);
    }
    return id === this.selectedArtwork;
  }

  getArtworks():void {
    this.categoryService.getCategories().then((response) => {
      this.categories = response;
    });
    this.artworkService.getArtworks().then((result) => {
      this.artworks = result;  
    }).then(() => {
      let x = this.artworks.length,
          ct = 0;
      for (let i = 0; i < x; i++) {
        ct += this.artworks[i].length;
      } 
      this.imageCt = ct;
    });
  }

  goToCategory(category:Category):void {
    this.selectedCategory = category;
    //window.location.hash = category.anchorId;
    this.router.navigate(['.'], { relativeTo: this.route, fragment: category.anchorId });
  }

  goToDetail(artwork:Art):void {
    this.onSelect(artwork);
    // this.selectedArtwork.id is a required parameter for the project-detail component
    // so include it after the url in the 'link parameters array':
    this.router .navigate(['/artworks', this.selectedArtwork]);
  }

  // stores artwork & DOMimg element in images array -- only want to store it in the array once,
  // done when the img's (load) event occurs the first time.  To make sure it is only
  // stored once (and not restored on subsequent loads), the id of an artwork is stored in the 
  // 'loaded' object on first load
  //    NOTE:  artwork ids MUST BE UNIQUE or images won't be lazy loaded!!  Could use artwork reference
  //    rather than id so lazy loading works BUT nonunique ids create problem when going to detail and 
  //    that problem will be harder to detect.
  // The 'images' array is used by checkLazyLoad(), which is called when (window:scroll) and 
  // (window:resize) events occur on containe div (only want to process scroll/resize event once 
  // -- don't want every img element listening for scroll/resize)
  // checkLazyLoad() checks images remaining in the 'images' array to know which images still haven't been lazy loaded (because they haven't been in the viewport)
  // Images in the 'images' array that are now in the viewport have their srcset property set to
  // their SRCSET value, which triggers an image download for that img element only. Then the image
  // is removed from the 'images' array (but not the 'loaded' array)
  onLoad(artwork, event) {

    // only want to do this once
    if (!(artwork.id in this.loaded)) {

      this.loaded[artwork.id] = artwork;
     
      // if it's in the viewport, go ahead and load it
      if (this.isElementInViewport(event.target)) {
        this.doLazyLoad(artwork);
      }
      // otherwise, store it
      else {
        this.images.push( {artwork: artwork, target: event.target } );
      }
    }
  }

  checkLazyLoad() {
    // loop over images array
    for (let i = this.images.length - 1; i >= 0; i--) {
      if (this.isElementInViewport(this.images[i].target)) {
        this.doLazyLoad(this.images[i].artwork);
        this.images.splice(i, 1);  // ok since looping from end of array
      }
    }
  }

  doLazyLoad(artwork) {
    if (artwork.srcset !== artwork.SRCSET) {
      artwork.srcset = artwork.SRCSET;

    }
  }

  isElementInViewport(el) {
    var rect = el.getBoundingClientRect()

    return (
       	rect.top    >= 0
	    && rect.left   >= 0
	    && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    )
  }  // end elementInViewport
}
