import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ArtworkService } from '../../services/artwork.service';
import { Art } from '../art';

@Component({
  selector: 'app-artwork-detail',
  templateUrl: './artwork-detail.component.html',
  styleUrls: ['./artwork-detail.component.css']
})
export class ArtworkDetailComponent implements OnInit {

  constructor(
    private artworkService:ArtworkService, 
    private router:Router,
    private route:ActivatedRoute) {

  }

  ngOnInit():void {
    this.route.params.forEach((params:Params) => {
      // + converts the 'id' string to a number
      let id = +params['id'];
      this.artworkService.getArtwork(id)
      .then(artwork => this.artwork = artwork);
    });
  }

  artwork:Art;

  goBack():void {
    //window.history.back();
    let id = this.artwork ? this.artwork.id : null;
    this.router.navigate(['/artworks', { artid: id }]);
  }

}
