import { Component, OnInit, AfterViewChecked } from '@angular/core';
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
export class ArtworksComponent implements OnInit, AfterViewChecked {

  ngOnInit():void {
    this.getArtworks(); 
    this.route.fragment.forEach((frag: string) => {
      this.fragment = frag;
      console.log(frag);
      if (frag) {
          // you can use DomAdapter
          const element = document.querySelector("#" + frag);
          if (element) { 
            element.scrollIntoView(true);  // experimental method
          }
        }
    }); 
    this.images = new Array();
    this.loaded = new Array();
    this.arrayIsReversed = false;
  }

  ngAfterViewChecked():void {
    console.log("after view checked");
    console.log("imageCt: " + this.imageCt + ", loaded: " + this.images.length);
    if (this.images.length === this.imageCt) {
      console.log("reversing array");
      this.images.reverse();
      this.arrayIsReversed = true;
      
    }
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
  selectedArtwork:Art;
  artworks:[Art[]];
  innerWidth:number = window.innerWidth;
  fragment:string;
  images;
  loaded:boolean[] = new Array();
  arrayIsReversed:boolean;
  imageCt:number;

  onResize(event) {
    event.target.innerWidth;
  }

  onSelect(artwork:Art): void {
    this.selectedArtwork = artwork;
  }

  getArtworks():void {
    this.categoryService.getCategories().then((response) => {
      this.categories = response;
    });
    this.artworkService.getArtworks().then((result) => {
      // cast results to extended Art class so we can define some loading-related properties
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
    this.router.navigate(['.'], { relativeTo: this.route, fragment: category.name });
  }

  goToDetail(artwork:Art):void {
    this.onSelect(artwork);
    this.router.navigate(['/artworks', this.selectedArtwork.id]);
  }

  // stores artwork & DOMimg element in images array -- only want to store it once in array
  // (onLoad) is called each time the image's source is updated.  To make sure it is only
  // stored once, the id of an artwork is stored in the loaded object on first load
  // NOTE:  artwork ids MUST BE UNIQUE or images won't be lazy loaded!!  Could use artwork reference
  //  rather than id so lazy loading works BUT nonunique ids create problem when going to detail and that
  //  problem will be harder to detect.
  // The images array is used by onScroll(), which is called when (window:scroll) event occurs on containe div
  //  (only want to process scroll once -- don't want every img element listening for scroll)
  // onScroll() checks images remaining in the 'images' array to know which images still haven't been lazy loaded.  
  // After view is initially loaded with blank images, the images array will be fully populated and needs to be 
  // reversed before first scroll occurs so that images are lazy loaded top to bottom since the images array
  // is iterated over from back to front so images can immediately be removed from the array after they've been lazy
  // loaded without affecting loop).
  onLoad(artwork, event) {

    // only want to do this once
    if (!(artwork.id in this.loaded)) {
      //console.log(artwork.id + " not lazy loaded yet");
      this.images.push( {artwork: artwork, target: event.target } );
      this.loaded[artwork.id] = false;
    }
  }

  onScroll() {
    //console.log('scroll occurred; array reversed: ' + this.arrayIsReversed);
    this.checkLazyLoad();
  }

  checkLazyLoad() {
    // don't allow lazy loading until images array has been completely
    // loaded and reversed
    if (this.arrayIsReversed) {
      // loop over images array
      for (let i = this.images.length - 1; i >= 0; i--) {
        if (this.elementInViewport(this.images[i].target)) {
          this.lazyLoad(this.images[i].artwork);
          this.images.splice(i, 1);  // ok since looping from end of array
        }
      };
    }
  }

  lazyLoad(artwork) {
    //console.log(artwork.id + " in viewport");
    if (artwork.srcset !== artwork.SRCSET) {
      artwork.srcset = artwork.SRCSET;
      //console.log(artwork.id + " lazy loaded");

    }
  }

  elementInViewport(el) {
    var rect = el.getBoundingClientRect()

    return (
       	rect.top    >= 0
	    && rect.left   >= 0
	    && rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    )
  }  // end elementInViewport
}
